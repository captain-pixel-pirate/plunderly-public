const express = require("express");
const router = express.Router();
const https = require("https");
const { JSDOM } = require("jsdom");

const { userRateLimiter, globalRateLimiter } = require("../lib/rateLimiter");

router.get("/", async (req, res) => {
  const ip = req.ip;

  try {
    await userRateLimiter.consume(ip);
  } catch (rateLimiterRes) {
    const retryAfterSec = Math.ceil(rateLimiterRes.msBeforeNext / 1000);
    const resetAt = new Date(
      Date.now() + rateLimiterRes.msBeforeNext
    ).toISOString();

    return res.status(429).json({
      error: `Too many requests. Please try again in ${formatRetryTime(
        retryAfterSec
      )}.`,
      type: "per-user",
      retryAfter: retryAfterSec,
      resetAt,
    });
  }

  try {
    await globalRateLimiter.consume("global");
  } catch (rateLimiterRes) {
    const retryAfterSec = Math.ceil(rateLimiterRes.msBeforeNext / 1000);
    const resetAt = new Date(
      Date.now() + rateLimiterRes.msBeforeNext
    ).toISOString();

    return res.status(429).json({
      error: `Too many requests globally. Please try again in ${formatRetryTime(
        retryAfterSec
      )}.`,
      type: "global",
      retryAfter: retryAfterSec,
      resetAt,
    });
  }

  try {
    const { pirateName, ocean } = req.query;

    if (!pirateName || !ocean) {
      return res.status(400).json({
        error: "Missing required fields: pirateName and ocean are required.",
      });
    }

    const cleanedPirateName = pirateName.replace(/[^a-zA-Z-]/g, "");
    if (cleanedPirateName.length < 2) {
      return res.status(400).json({
        error: "Pirate name must contain at least 2 alphabetic characters.",
      });
    }

    const scrapeResult = await scrapePuzzlesFromPirateProfile(
      cleanedPirateName,
      ocean
    );

    if (scrapeResult.error) {
      return res.status(404).json({
        error: "Pirate profile not found. Please check the name and ocean.",
      });
    }

    const formattedPuzzles = scrapeResult.puzzles.map((craftingPuzzle) => {
      switch (craftingPuzzle.puzzle) {
        case "Distilling":
          return { ...craftingPuzzle, puzzle: "distillery" };
        case "Alchemistry":
          return { ...craftingPuzzle, puzzle: "apothecary" };
        case "Shipwrightery":
          return { ...craftingPuzzle, puzzle: "shipyard" };
        case "Blacksmithing":
          return { ...craftingPuzzle, puzzle: "ironMonger" };
        case "Weaving":
          return { ...craftingPuzzle, puzzle: "weavery" };
        default:
          return craftingPuzzle;
      }
    });

    return res.json({ puzzles: formattedPuzzles });
  } catch (error) {
    console.error("🔥 Server Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

function scrapePuzzlesFromPirateProfile(pirateName, ocean) {
  const url = `https://${ocean}.puzzlepirates.com/yoweb/pirate.wm?classic=false&target=${encodeURIComponent(
    pirateName
  )}`;

  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const dom = new JSDOM(data);
            const document = dom.window.document;

            const table = document.querySelector(
              "body > table > tbody > tr > td:nth-child(3) > table > tbody > tr:nth-child(10) > td:nth-child(1) > table"
            );

            if (!table) {
              return resolve({
                error: true,
                reason: "Profile not found or layout changed",
              });
            }

            const rows = table.querySelectorAll("tbody > tr");
            const puzzles = [];

            rows.forEach((row) => {
              const imgElement = row.querySelector("td a img");
              const fontElement = row.querySelector("td font");

              if (imgElement && fontElement) {
                const puzzle = imgElement.getAttribute("alt");
                const experienceRankText = fontElement.textContent.trim();
                const [experience, rank] = experienceRankText.split("/");

                if (puzzle && experience && rank && puzzle !== "Foraging") {
                  puzzles.push({
                    puzzle,
                    experience: experience.trim(),
                    rank: rank.trim(),
                  });
                }
              }
            });

            resolve({ error: false, puzzles });
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

function formatRetryTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const parts = [];
  if (h) parts.push(`${h} hour${h !== 1 ? "s" : ""}`);
  if (m) parts.push(`${m} minute${m !== 1 ? "s" : ""}`);
  if (s || (!h && !m)) parts.push(`${s} second${s !== 1 ? "s" : ""}`);

  return parts.join(" and ");
}

module.exports = router;
