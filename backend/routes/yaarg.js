const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs/promises");
const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require("uuid");

const { Buy, Sell, Upload, Ocean, Stall } = require("../models");
const { runRsync } = require("../lib/rsnyc-logger.js");
const RateLimiterRedis = require("rate-limiter-flexible").RateLimiterRedis;
const redisClient = require("../lib/redis");

// ---- Config ----
const REMOTE = process.env.YARRG_REMOTE || "rsync.yarrg.chiark.net::yarrg/";
const LOCAL_DIR =
  process.env.YARRG_LOCAL_DIR ||
  process.env.RAILWAY_VOLUME_MOUNT_PATH ||
  path.resolve(__dirname, "..", "data", "yaarg");
const LOCK_FILE = path.join(LOCAL_DIR, ".sync.lock");

/**
 * Global toggle: when false (default), skip rsync and only use existing local SQLite files
 * to refresh the DB. When true, perform the full rsync + DB refresh flow.
 */
const YARRG_SYNC_ENABLED = process.env.YARRG_SYNC_ENABLED === "true";

// 12-hour global limiter for refresh
const yarrgRefreshLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rl_yarrg_refresh",
  points: 1,
  duration: 12 * 60 * 60, // 12 hours
});

// ---- Route ----
router.post("/refresh", async (req, res) => {
  console.log(
    `[yarrg-sync] Received refresh request at ${new Date().toISOString()}`
  );

  const startedAt = new Date().toISOString();

  // === SHORT-CIRCUIT: sync disabled, just import from existing local files ===
  if (!YARRG_SYNC_ENABLED) {
    console.warn(
      "[yarrg-sync] Sync disabled by config (YARRG_SYNC_ENABLED=false). Using existing local data only."
    );
    try {
      await ensureDir(LOCAL_DIR);
      const dbUpdateResult = await updateDatabaseWithFreshData();

      return res.json({
        message:
          "Sync disabled; database refreshed from existing local SQLite files.",
        startedAt,
        finishedAt: new Date().toISOString(),
        exitCode: null, // no rsync executed
        changes: null,
        totals: null,
        databaseUpdate: dbUpdateResult,
        localDir: LOCAL_DIR,
        remote: REMOTE,
        stdout: "",
        stderr: "",
        syncEnabled: YARRG_SYNC_ENABLED,
      });
    } catch (err) {
      console.error("[yarrg-sync] FAILED (no-sync mode):", err.message);
      return res.status(500).json({
        error:
          "Internal server error during local-only database refresh (sync disabled)",
        detail: err.message,
        stderr: err.err || "",
        syncEnabled: YARRG_SYNC_ENABLED,
      });
    }
  }

  // === Normal flow: rate limit -> lock -> rsync -> DB update ===

  // Enforce one successful trigger per 12 hours globally
  try {
    await yarrgRefreshLimiter.consume("global");
  } catch (rateLimiterRes) {
    const retryAfterSec = Math.ceil(rateLimiterRes.msBeforeNext / 1000);
    const resetAt = new Date(
      Date.now() + rateLimiterRes.msBeforeNext
    ).toISOString();
    return res.status(429).json({
      error: `Refresh allowed only once every 12hrs. Try again in ${formatRetryTime(
        retryAfterSec
      )}.`,
      type: "global",
      retryAfter: retryAfterSec,
      resetAt,
      syncEnabled: YARRG_SYNC_ENABLED,
    });
  }

  if (!(await acquireLock())) {
    console.warn("[yarrg-sync] Sync already in progress, skipping.");
    return res
      .status(423)
      .json({ error: "Sync already in progress. Try again later." });
  }

  console.log(
    `[yarrg-sync] Starting sync from ${REMOTE} into ${LOCAL_DIR} (sync enabled)`
  );

  try {
    await ensureDir(LOCAL_DIR);

    const result = await runRsync();
    const { added, updated, deleted, perFile, totals } = result.changes;

    // High-level summary
    const sizeHuman = totals.totalSizeHuman || "unknown";
    const sentHuman = totals.sentHuman || "unknown";
    const recvHuman = totals.receivedHuman || "unknown";
    console.log(
      `[yarrg-sync] Changes — Added: ${added}, Updated: ${updated}, Deleted: ${deleted} | ` +
        `Total: ${sizeHuman}, Sent: ${sentHuman}, Received: ${recvHuman}` +
        (totals.speed ? `, Speed: ${totals.speed}` : "")
    );
    Object.entries(perFile).forEach(([file, status]) =>
      console.log(`[yarrg-sync] ${file}: ${status}`)
    );

    // Update database with fresh data if sync was successful
    let dbUpdateResult = null;
    if (result.code === 0 || result.code === 24) {
      try {
        dbUpdateResult = await updateDatabaseWithFreshData();
      } catch (dbError) {
        console.error("[yarrg-sync] Database update failed:", dbError.message);
        return res.status(500).json({
          error: "Sync successful but database update failed",
          detail: dbError.message,
          syncResult: {
            exitCode: result.code,
            changes: { added, updated, deleted, perFile },
            totals: {
              totalSizeBytes: totals.totalSizeBytes,
              totalSizeHuman: sizeHuman,
              sentBytes: totals.sentBytes,
              sentHuman: sentHuman,
              receivedBytes: totals.receivedBytes,
              receivedHuman: recvHuman,
              speed: totals.speed,
            },
          },
          syncEnabled: YARRG_SYNC_ENABLED,
        });
      }
    }

    return res.json({
      message: "YARRG data refreshed successfully",
      startedAt,
      finishedAt: new Date().toISOString(),
      exitCode: result.code,
      changes: { added, updated, deleted, perFile },
      totals: {
        totalSizeBytes: totals.totalSizeBytes,
        totalSizeHuman: sizeHuman,
        sentBytes: totals.sentBytes,
        sentHuman: sentHuman,
        receivedBytes: totals.receivedBytes,
        receivedHuman: recvHuman,
        speed: totals.speed,
      },
      databaseUpdate: dbUpdateResult,
      localDir: LOCAL_DIR,
      remote: REMOTE,
      stdout: result.out.trim(),
      stderr: result.err.trim(),
      syncEnabled: YARRG_SYNC_ENABLED,
    });
  } catch (err) {
    console.error("[yarrg-sync] FAILED:", err.message);
    if (err.err) console.error("[yarrg-sync] STDERR:", err.err.trim());
    return res.status(500).json({
      error: "Internal server error during rsync",
      detail: err.message,
      stderr: err.err || "",
      syncEnabled: YARRG_SYNC_ENABLED,
    });
  } finally {
    console.log("[yarrg-sync] Releasing lock.");
    await releaseLock();
  }
});

async function updateDatabaseWithFreshData() {
  console.log("[yarrg-sync] Starting database update with fresh data...");

  const SQLITE_FILES = [
    { name: "Emerald", path: path.join(LOCAL_DIR, "OCEAN-Emerald.db") },
    { name: "Meridian", path: path.join(LOCAL_DIR, "OCEAN-Meridian.db") },
    { name: "Cerulean", path: path.join(LOCAL_DIR, "OCEAN-Cerulean.db") },
  ];

  console.log(`[yarrg-sync] Looking for SQLite files in: ${LOCAL_DIR}`);

  // Verify Oceans exist in database
  const oceans = await Ocean.findAll();
  if (oceans.length === 0) {
    throw new Error(
      "No Oceans found in database. Please ensure the database is properly seeded."
    );
  }
  console.log(
    `[yarrg-sync] Found ${oceans.length} oceans in database:`,
    oceans.map((o) => o.name)
  );

  // Clear existing data
  console.log(
    "[yarrg-sync] Clearing existing Buys, Sells, and Uploads data..."
  );
  await Buy.destroy({ where: {} });
  await Sell.destroy({ where: {} });
  await Upload.destroy({ where: {} });
  await Stall.destroy({ where: {} });

  let totalBuys = 0;
  let totalSells = 0;
  let totalUploads = 0;
  let totalStalls = 0;

  for (const ocean of SQLITE_FILES) {
    console.log(`[yarrg-sync] Processing ${ocean.name} data...`);

    // Check if file exists
    try {
      await fs.access(ocean.path);
    } catch (err) {
      console.warn(`[yarrg-sync] File ${ocean.path} not found, skipping...`);
      continue;
    }

    const data = await extractSQLiteData(ocean.path);
    const oceanRecord = await Ocean.findOne({ where: { name: ocean.name } });

    if (!oceanRecord) {
      console.warn(
        `[yarrg-sync] Ocean ${ocean.name} not found in database, skipping...`
      );
      continue;
    }

    const oceanPrefix = ocean.name.charAt(0).toUpperCase();

    // Process Stalls
    if (data.stalls && data.stalls.length > 0) {
      const stalls = data.stalls.map((stall) => ({
        id: `${oceanPrefix}${stall.stallid}`,
        stallname: stall.stallname,
        islandid: `${oceanPrefix}${stall.islandid}`,
        oceanId: oceanRecord.id,
      }));

      if (stalls.length > 0) {
        await Stall.bulkCreate(stalls);
        totalStalls += stalls.length;
        console.log(
          `[yarrg-sync] Added ${stalls.length} stalls for ${ocean.name}`
        );
      }
    }

    // Process Buys
    if (data.buys && data.buys.length > 0) {
      const buys = data.buys.map((buy) => ({
        id: uuidv4(),
        price: buy.price || 0,
        qty: buy.qty || 0,
        commodid: buy.commodid || 0,
        islandid: `${oceanPrefix}${buy.islandid}`,
        stallid: `${oceanPrefix}${buy.stallid}`,
        oceanId: oceanRecord.id,
      }));

      if (buys.length > 0) {
        await Buy.bulkCreate(buys);
        totalBuys += buys.length;
        console.log(`[yarrg-sync] Added ${buys.length} buys for ${ocean.name}`);
      }
    }

    // Process Sells
    if (data.sells && data.sells.length > 0) {
      const sells = data.sells.map((sell) => ({
        id: uuidv4(),
        price: sell.price || 0,
        qty: sell.qty || 0,
        commodid: sell.commodid || 0,
        islandid: `${oceanPrefix}${sell.islandid}`,
        stallid: `${oceanPrefix}${sell.stallid}`,
        oceanId: oceanRecord.id,
      }));

      if (sells.length > 0) {
        await Sell.bulkCreate(sells);
        totalSells += sells.length;
        console.log(
          `[yarrg-sync] Added ${sells.length} sells for ${ocean.name}`
        );
      }
    }

    // Process Uploads
    if (data.uploads && data.uploads.length > 0) {
      const uploads = data.uploads.map((upload) => ({
        id: uuidv4(),
        timestamp: upload.timestamp,
        uploadTimestamp: upload.timestamp,
        islandid: `${oceanPrefix}${upload.islandid}`,
        oceanId: oceanRecord.id,
      }));

      if (uploads.length > 0) {
        await Upload.bulkCreate(uploads);
        totalUploads += uploads.length;
        console.log(
          `[yarrg-sync] Added ${uploads.length} uploads for ${ocean.name}`
        );
      }
    }
  }

  console.log(
    `[yarrg-sync] Database update complete! Added ${totalBuys} buys, ${totalSells} sells, ${totalUploads} uploads`
  );
  return { totalBuys, totalSells, totalUploads };
}

async function extractSQLiteData(dbPath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error(
          `[yarrg-sync] Failed to open SQLite database ${dbPath}:`,
          err.message
        );
        reject(err);
        return;
      }
    });

    const queries = {
      buys: "SELECT * FROM buy;",
      sells: "SELECT * FROM sell;",
      uploads: "SELECT * FROM uploads;",
      stalls: "SELECT * FROM stalls;",
    };

    const data = {};
    let pendingQueries = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, sql]) => {
      db.all(sql, [], (err, rows) => {
        if (err) {
          console.warn(`[yarrg-sync] Query failed for ${key}:`, err.message);
          data[key] = []; // Set empty array instead of rejecting
        } else {
          data[key] = rows || [];
        }
        pendingQueries--;

        if (pendingQueries === 0) {
          db.close();
          resolve(data);
        }
      });
    });
  });
}

// ---- Helpers ----
async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function acquireLock() {
  await ensureDir(LOCAL_DIR);
  try {
    const fh = await fs.open(LOCK_FILE, "wx"); // fail if exists
    await fh.writeFile(String(process.pid));
    await fh.close();
    return true;
  } catch {
    return false;
  }
}

async function releaseLock() {
  try {
    await fs.unlink(LOCK_FILE);
  } catch {}
}

function formatRetryTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (h) parts.push(`${h} hour${h !== 1 ? "s" : ""}`);
  if (m) parts.push(`${m} minute${m !== 1 ? "s" : ""}`);

  return parts.join(" and ");
}

module.exports = router;
