const express = require("express");
const fs = require("fs");
const router = express.Router();

const { Recipe, Commod, CommodClass } = require("../models");
const { verifyHMAC } = require("../lib/hmac-signature.js");

router.get("/", verifyHMAC, async (req, res) => {
  try {
    const recipes = await Recipe.findAll({
      include: [
        {
          model: Commod,
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
          through: { attributes: ["units"] },
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    const recipesWithCommods = recipes.map((recipe) => {
      const data = recipe.toJSON();
      const commods = data.Commods.map((commod) => {
        const commodData = { ...commod };

        delete commodData.RecipeCommod;
        delete commodData.CommodClass;

        return {
          units: commod.RecipeCommod.units,
          commod: commodData,
        };
      });
      delete data.Commods;
      return { ...data, commods };
    });

    fs.writeFile(
      "recipes.json",
      JSON.stringify(recipesWithCommods, null, 2),
      (err) => {
        if (err) {
          console.error("Error writing recipes.json file:", err);
        }
      }
    );

    res.json(recipesWithCommods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
