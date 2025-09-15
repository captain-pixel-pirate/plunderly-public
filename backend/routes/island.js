const express = require("express");
const router = express.Router();

const { Island, Buy, Commod, Stall, CommodClass } = require("../models");
const { verifyHMAC } = require("../lib/hmac-signature.js");

router.get("/", verifyHMAC, async (req, res) => {
  try {
    if (!req.body || !req.body.islandname || !req.body.oceanId) {
      console.log("❌ islandname is required. ❌ oceanId is required.");
      return res
        .status(400)
        .json({ error: "islandname and oceanId are required" });
    }

    const islandName = req.body.islandname;
    const oceanId = req.body.oceanId;

    const island = await Island.findOne({
      where: { islandname: islandName, oceanId: oceanId },
      include: [
        {
          model: Buy,
          as: "buys",
          include: [
            {
              model: Commod,
              as: "commod",
              include: [
                {
                  model: CommodClass,
                  as: "commodclass",
                  attributes: {
                    exclude: ["createdAt", "updatedAt"],
                  },
                },
              ],
              attributes: {
                exclude: [
                  "createdAt",
                  "updatedAt",
                  "emeraldtax",
                  "meridiantax",
                  "ceruleantax",
                  "unitmass",
                  "unitvolume",
                ],
              },
            },
            {
              model: Stall,
              as: "stall",
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          required: true,
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!island) {
      console.log("❌ Island not found");
      return res.status(404).json({ error: "Island not found" });
    }

    return res.json({
      island: island.toJSON(),
    });
  } catch (error) {
    console.error("🔥 Server Error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

module.exports = router;
