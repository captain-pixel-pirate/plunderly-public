const path = require("path");
const { spawn } = require("child_process");

const REMOTE = process.env.YARRG_REMOTE || "rsync.yarrg.chiark.net::yarrg/";
const LOCAL_DIR =
  process.env.YARRG_LOCAL_DIR || path.resolve(__dirname, "..", "data", "yaarg");

const TARGET_FILES = new Set([
  "OCEAN-Emerald.db",
  "OCEAN-Meridian.db",
  "OCEAN-Cerulean.db",
]);

/**
 * Parse rsync --itemize-changes output.
 * Captures added/updated/deleted for our target files and transfer stats.
 */
function parseItemized(output) {
  const lines = output
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let added = 0,
    updated = 0,
    deleted = 0;
  const perFile = {};
  let totalSizeBytes = null;
  let sentBytes = null;
  let receivedBytes = null;
  let speed = null;

  for (const line of lines) {
    // Deletions
    if (line.startsWith("deleting ")) {
      const name = line.substring("deleting ".length).trim();
      if (TARGET_FILES.has(name)) {
        deleted++;
        perFile[name] = "deleted";
      }
      continue;
    }

    // Itemized change line
    const m = line.match(/^([<>ch\*\.][^\s]*)\s+(.+)$/);
    if (m) {
      const flags = m[1];
      const name = path.basename(m[2]);

      if (!TARGET_FILES.has(name)) continue;

      if (flags.startsWith(">f+++++++++")) {
        added++;
        perFile[name] = "added";
      } else if (flags.startsWith(">f")) {
        updated++;
        perFile[name] = "updated";
      }
      continue;
    }

    // Transfer summary lines
    // Example: "total size is 17195008  speedup is 5.93"
    const tot = line.match(/total size is (\d+)/i);
    if (tot) {
      totalSizeBytes = Number(tot[1]);
      continue;
    }

    // Example: "sent 183 bytes  received 2897149 bytes  28973320000 bytes/sec"
    const tx = line.match(
      /sent\s+(\d+)\s+bytes\s+received\s+(\d+)\s+bytes\s+([0-9.]+)\s+bytes\/sec/i
    );
    if (tx) {
      sentBytes = Number(tx[1]);
      receivedBytes = Number(tx[2]);
      speed = `${tx[3]} bytes/sec`;
      continue;
    }
  }

  return {
    added,
    updated,
    deleted,
    perFile,
    totals: {
      totalSizeBytes,
      sentBytes,
      receivedBytes,
      speed,
      // preformatted for convenience
      totalSizeHuman:
        totalSizeBytes != null ? formatBytes(totalSizeBytes).human : null,
      sentHuman: sentBytes != null ? formatBytes(sentBytes).human : null,
      receivedHuman:
        receivedBytes != null ? formatBytes(receivedBytes).human : null,
    },
  };
}

function formatBytes(bytes) {
  const b = Number(bytes);
  if (!isFinite(b) || b < 0) return { bytes: 0, mb: 0, gb: 0, human: "0 B" };
  const mb = b / (1024 * 1024);
  const gb = mb / 1024;
  const human =
    gb >= 1
      ? `${gb.toFixed(3)} GB`
      : mb >= 1
      ? `${mb.toFixed(2)} MB`
      : `${b} B`;
  return { bytes: b, mb, gb, human };
}

function runRsync() {
  return new Promise((resolve, reject) => {
    const args = [
      "-avzi", // archive, verbose, compress, itemize-changes
      "--delete", // mirror deletes
      "--timeout=60", // old-rsync-friendly

      // include dirs so rsync can traverse
      "--include",
      "*/",

      // include only the DBs we care about
      "--include",
      "OCEAN-Emerald.db",
      "--include",
      "OCEAN-Meridian.db",
      "--include",
      "OCEAN-Cerulean.db",

      // exclude everything else
      "--exclude",
      "*",

      REMOTE,
      LOCAL_DIR + "/",
    ];

    console.log(`[yarrg-sync] Running: rsync ${args.join(" ")}`);

    const child = spawn("rsync", args, { stdio: ["ignore", "pipe", "pipe"] });

    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (err += d.toString()));

    child.on("close", (code) => {
      console.log(`[yarrg-sync] rsync finished with code ${code}`);
      if (out.trim()) console.log("[yarrg-sync] rsync stdout:\n" + out.trim());
      if (err.trim()) console.warn("[yarrg-sync] rsync stderr:\n" + err.trim());

      // 0 = success; 24 = 'vanished files' — usually harmless
      if (code === 0 || code === 24) {
        const changes = parseItemized(out);
        resolve({ code, out, err, changes });
      } else {
        const e = new Error(`rsync exited with ${code}`);
        e.code = code;
        e.out = out;
        e.err = err;
        reject(e);
      }
    });
  });
}

module.exports = {
  parseItemized,
  formatBytes,
  runRsync,
};
