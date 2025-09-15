const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const { Ocean, Island, CommodClass } = require("../models");
const { verifyHMAC } = require("../lib/hmac-signature.js");

router.get("/default", verifyHMAC, async (req, res) => {
  try {
    const oceans = await Ocean.findAll({
      where: { name: "Emerald" },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    const commodclasses = await CommodClass.findAll({
      attributes: { exclude: ["createdAt", "updatedAt", "maxposinclass"] },
    });

    for (let i = 0; i < oceans.length; i++) {
      const islands = await Island.findAll({
        where: { oceanId: oceans[i].id },
        include: [
          {
            association: "spawns",
            through: { attributes: [] },
            include: [
              {
                model: CommodClass,
                as: "commodclass",
                attributes: {
                  exclude: ["createdAt", "updatedAt", "maxposinclass"],
                },
              },
            ],
            attributes: {
              exclude: [
                "createdAt",
                "updatedAt",
                "emeraldtax",
                "ceruleantax",
                "meridiantax",
                "unitmass",
                "unitvolume",
              ],
            },
          },
        ],
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });

      const oceanObj = oceans[i].get({ plain: true });
      const archipelagosMap = new Map();

      for (let j = 0; j < islands.length; j++) {
        const island = islands[j].get({ plain: true });
        const archipelagoName = island.archipelago;

        if (!archipelagosMap.has(archipelagoName)) {
          archipelagosMap.set(archipelagoName, []);
        }
        archipelagosMap.get(archipelagoName).push(island);
      }

      oceanObj.archipelagos = Array.from(
        archipelagosMap,
        ([name, islands]) => ({
          name,
          islands,
          lastUpdated: new Date("2000-01-01"),
        })
      );
      oceans[i] = oceanObj;
    }

    const filePath = path.join(__dirname, "oceans.json");
    fs.writeFileSync(filePath, JSON.stringify(oceans, null, 2));

    const filePath2 = path.join(__dirname, "commodclasses.json");
    fs.writeFileSync(filePath2, JSON.stringify(commodclasses, null, 2));

    res.json(oceans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const oceans = await Ocean.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    res.json(oceans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
