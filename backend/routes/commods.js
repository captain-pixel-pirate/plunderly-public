const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");

const { Commod, CommodClass } = require("../models");
const commodsCost = require("../data/commod-costs.json");

function serializeCommod(commod) {
  const data = commod.toJSON();

  data.emeraldtax = parseFloat(data.emeraldtax);
  data.ceruleantax = parseFloat(data.ceruleantax);
  data.meridiantax = parseFloat(data.meridiantax);

  // keep associated class as `commodclass` for consistency
  data.commodclass = data.commodclass;

  // attach pricePerUnit from static lookup
  data.pricePerUnit =
    commodsCost.find(
      (c) => c.resource.toLowerCase() === commod.commodname.toLowerCase()
    )?.pricePerUnit ?? 0;

  delete data.CommodClass;
  return data;
}

router.get("/", async (req, res) => {
  try {
    const commods = await Commod.findAll({
      include: [{ model: CommodClass, as: "commodclass" }],
    });

    const result = commods.map(serializeCommod);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /commods/:idOrName  -> fetch one by numeric ID or by name (case-insensitive)
router.get("/:idOrName", async (req, res) => {
  try {
    const { idOrName } = req.params;

    // try numeric id first
    const asNumber = Number(idOrName);
    const isNumeric = Number.isInteger(asNumber) && !Number.isNaN(asNumber);

    let commod;

    if (isNumeric) {
      commod = await Commod.findByPk(asNumber, {
        include: [{ model: CommodClass, as: "commodclass" }],
      });
    }

    if (!commod) {
      // fallback: name (case-insensitive)
      // NOTE: Op.iLike is Postgres-specific. If you're on MySQL/SQLite, replace with Op.like and ensure collation/lowercasing.
      commod =
        (await Commod.findOne({
          where: { commodname: { [Op.iLike]: idOrName } },
          include: [{ model: CommodClass, as: "commodclass" }],
        })) ||
        (await Commod.findOne({
          where: { commodname: { [Op.iLike]: idOrName.toLowerCase() } },
          include: [{ model: CommodClass, as: "commodclass" }],
        })) ||
        (await Commod.findOne({
          where: { commodname: { [Op.iLike]: idOrName.toUpperCase() } },
          include: [{ model: CommodClass, as: "commodclass" }],
        }));
    }

    if (!commod) {
      return res.status(404).json({ error: "Commodity not found." });
    }

    const result = serializeCommod(commod);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
