const express = require("express");
const router = express.Router();

const {
  Buy,
  Sell,
  Commod,
  Stall,
  Island,
  CommodClass,
  Upload,
} = require("../models");

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const { islandname, oceanId, commodclass } = req.query;

    if (!islandname || !oceanId || !commodclass) {
      console.warn("[GET /] Missing required query params:", {
        islandname,
        oceanId,
        commodclass,
      });
      return res
        .status(400)
        .json({ error: "islandname, oceanId, and commodclass are required" });
    }

    const island = await Island.findOne({
      where: { islandname, oceanId },
    });

    if (!island) {
      console.warn(
        `[GET /] Island not found for islandname=${islandname}, oceanId=${oceanId}`
      );
      return res.status(404).json({ error: "Island not found" });
    }

    const islandid = island.id;

    const includeOptions = [
      {
        model: Commod,
        as: "commod",
        required: true,
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "emeraldtax",
            "meridiantax",
            "ceruleantax",
          ],
        },
        include: [
          {
            model: CommodClass,
            as: "commodclass",
            required: true,
            attributes: {
              exclude: ["createdAt", "updatedAt", "maxposinclass"],
            },
            where: { commodclass },
          },
        ],
      },
      {
        model: Stall,
        as: "stall",
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    ];

    const [buys, sells, upload] = await Promise.all([
      Buy.findAll({
        where: { islandid, oceanId },
        include: includeOptions,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      }),
      Sell.findAll({
        where: { islandid, oceanId },
        include: includeOptions,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      }),
      Upload.findOne({
        where: { islandid },
        attributes: { exclude: ["createdAt", "updatedAt"] },
      }),
    ]);

    res.json({ buys, sells, upload });
  })
);

router.use((err, req, res, next) => {
  console.error("[GET /] Unhandled error:", {
    message: err.message,
    stack: err.stack,
    route: req.originalUrl,
    params: req.query,
  });
  res.status(500).json({ error: "Internal server error" });
});

module.exports = router;
