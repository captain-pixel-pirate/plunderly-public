const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const { Vessel } = require("../models");
const { verifyHMAC } = require("../lib/hmac-signature.js");

router.get("/", verifyHMAC, async (req, res) => {
  try {
    const vessels = await Vessel.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    const filePath = path.join(__dirname, "vessels-out.json");
    fs.writeFileSync(filePath, JSON.stringify(vessels, null, 2));

    res.json(vessels);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
