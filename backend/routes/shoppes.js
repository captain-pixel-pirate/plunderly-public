const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const { Shoppe } = require("../models");
const { verifyHMAC } = require("../lib/hmac-signature.js");
const shoppesData = require("../data/shoppes/shoppes.json");

router.post("/seed", verifyHMAC, async (req, res) => {
  try {
    await Shoppe.bulkCreate(shoppesData, {
      ignoreDuplicates: true,
    });

    res.status(201).json({ message: "Shoppes seeded successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", verifyHMAC, async (req, res) => {
  try {
    let shoppes = await Shoppe.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      raw: true,
    });

    shoppes = shoppes.map((shoppe) => {
      if (shoppe.type && typeof shoppe.type === "string") {
        const words = shoppe.type.toLowerCase().split(" ");
        if (words.length === 2) {
          shoppe.type =
            words[0] + words[1][0].toUpperCase() + words[1].slice(1);
        } else {
          shoppe.type = words[0];
        }
      }
      return shoppe;
    });

    const filePath = path.join(__dirname, "shoppe-out.json");
    fs.writeFileSync(filePath, JSON.stringify(shoppes, null, 2));

    res.json(shoppes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
