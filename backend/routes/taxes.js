const express = require("express");
const puppeteer = require("puppeteer");
const router = express.Router();

const { Commod } = require("../models");
const { verifyHMAC } = require("../lib/hmac-signature.js");

const oceans = ["meridian", "emerald", "cerulean"];
const baseUrl = "https://{OCEAN}.puzzlepirates.com/yoweb/econ/taxrates.wm";
const selector =
  "body > center > table > tbody > tr > td:nth-child(1) > table > tbody";

const isProd = process.env.NODE_ENV === "production";

router.post("/refresh", verifyHMAC, async (req, res) => {
  let browser;
  let allUpdatedItems = [];

  try {
    browser = await puppeteer.launch({
      args: isProd ? ["--no-sandbox", "--disable-setuid-sandbox"] : [],
    });
    const page = await browser.newPage();

    for (const ocean of oceans) {
      const url = baseUrl.replace("{OCEAN}", ocean);
      console.log(`Navigating to: ${url}`);

      try {
        await page.goto(url, { waitUntil: "domcontentloaded" });
        console.log(`Loaded page for ocean: ${ocean}`);
      } catch (navErr) {
        console.error(`Error navigating to ${url}:`, navErr.message);
        continue;
      }

      let data;
      try {
        data = await page.evaluate((selector) => {
          const tableBody = document.querySelector(selector);
          if (!tableBody) return [];

          const rows = tableBody.querySelectorAll("tr");
          const result = [];

          rows.forEach((row) => {
            const columns = row.querySelectorAll("td");
            if (columns.length >= 2) {
              result.push({
                commodname: columns[0].textContent.trim(),
                tax: columns[1].textContent.trim(),
              });
            }
          });
          return result;
        }, selector);
        console.log(`Scraped ${data.length} items for ocean: ${ocean}`);
      } catch (scrapeErr) {
        console.error(`Error scraping data for ${ocean}:`, scrapeErr.message);
        continue;
      }

      const taxField = `${ocean}tax`;

      for (const item of data) {
        try {
          const commod = await Commod.findOne({
            where: { commodname: item.commodname },
          });

          if (commod) {
            await commod.update({ [taxField]: item.tax });
          } else {
            console.warn(`Commodity not found in DB: ${item.commodname}`);
          }
        } catch (dbErr) {
          console.error(
            `Error updating DB for ${item.commodname}:`,
            dbErr.message
          );
        }
      }

      allUpdatedItems = [...allUpdatedItems, ...data];
    }

    res.json({
      message: "Commodity database updated successfully",
    });
  } catch (err) {
    console.error("Fatal error during refresh:", err.message);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (browser) {
      await browser.close();
      console.log("Browser closed.");
    }
  }
});

module.exports = router;
