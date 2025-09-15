"use strict";

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const {
  Ocean,
  Commod,
  CommodClass,
  Island,
  Stall,
  Buy,
  Sell,
  Upload,
  Vessel,
  Distance,
  Route,
  Recipe,
  Shoppe,
} = require("../models");

const shoppesData = require(path.join(
  __dirname,
  "../data/shoppes/shoppes.json"
));

const vesselData = require(path.join(
  __dirname,
  "../data/vessels/vessels.json"
));

const SQLITE_FILES = [
  { name: "Emerald", path: path.join(__dirname, "./data/OCEAN-Emerald.db") },
  { name: "Meridian", path: path.join(__dirname, "./data/OCEAN-Meridian.db") },
  { name: "Cerulean", path: path.join(__dirname, "./data/OCEAN-Cerulean.db") },
];

const commod_taxes = [
  { name: "Emerald", path: path.join(__dirname, "./data/emerald-taxes.json") },
  {
    name: "Meridian",
    path: path.join(__dirname, "./data/meridian-taxes.json"),
  },
  {
    name: "Cerulean",
    path: path.join(__dirname, "./data/cerulean-taxes.json"),
  },
];

const taxDataMap = {};
commod_taxes.forEach(({ name, path: taxPath }) => {
  taxDataMap[name] = require(taxPath);
});

const archipelago_data = [
  {
    name: "Emerald",
    path: path.join(__dirname, "./data/islands/emerald.json"),
  },
  {
    name: "Meridian",
    path: path.join(__dirname, "./data/islands/meridian.json"),
  },
  {
    name: "Cerulean",
    path: path.join(__dirname, "./data/islands/cerulean.json"),
  },
];

const archipelagoDataMap = {};
archipelago_data.forEach(({ name, path: archipelagoPath }) => {
  archipelagoDataMap[name] = require(archipelagoPath);
});

const recipes = [
  {
    name: "shipyard",
    path: path.join(__dirname, "./data/recipes/shipyardRecipes.json"),
  },
  {
    name: "apothecary",
    path: path.join(__dirname, "./data/recipes/apothecaryRecipes.json"),
  },
  {
    name: "distillery",
    path: path.join(__dirname, "./data/recipes/distilleryRecipes.json"),
  },
  {
    name: "ironmonger",
    path: path.join(__dirname, "./data/recipes/ironmongerRecipes.json"),
  },
  {
    name: "weavery",
    path: path.join(__dirname, "./data/recipes/weaveryRecipes.json"),
  },
];

const recipeDataMap = {};
recipes.forEach(({ name, path: recipePath }) => {
  recipeDataMap[name] = require(recipePath);
});

function getTax(taxArray, commodname) {
  const record = taxArray.find(
    (item) => item.commodname.toLowerCase() === commodname.toLowerCase()
  );
  return record ? record.tax : 0;
}

function getIslandsFromArchipelago(archipelagos) {
  const islands = [];
  archipelagos.forEach((archipelago) => {
    archipelago.islands.forEach((island) => {
      islands.push(island);
    });
  });
  return islands;
}

async function extractSQLiteData(dbPath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) reject(err);
    });

    const queries = {
      islands: "SELECT * FROM islands;",
      stalls: "SELECT * FROM stalls;",
      buys: "SELECT * FROM buy;",
      sells: "SELECT * FROM sell;",
      uploads: "SELECT * FROM uploads;",
      commods: "SELECT * FROM commods;",
      commodsClass: "SELECT * FROM commodclasses;",
      distances: "SELECT * FROM dists;",
      routes: "SELECT * FROM routes;",
    };

    const data = {};
    let pendingQueries = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, sql]) => {
      db.all(sql, [], (err, rows) => {
        if (err) return reject(err);
        data[key] = rows;
        pendingQueries--;

        if (pendingQueries === 0) {
          db.close();
          resolve(data);
        }
      });
    });
  });
}

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log("--------------------");
      console.log("🌊 Seeding Oceans...");
      const oceanRecords = await Promise.all(
        SQLITE_FILES.map(async (ocean) => {
          return await Ocean.create({ name: ocean.name });
        })
      );

      const oceanMap = {};
      oceanRecords.forEach((ocean) => {
        oceanMap[ocean.name] = ocean.id;
      });

      console.log("📚 Seeding CommodClasses...");
      const commodsData = await extractSQLiteData(SQLITE_FILES[0].path);
      await CommodClass.bulkCreate(
        commodsData.commodsClass.map((commodClass) => ({
          commodclass: commodClass.commodclass,
          maxposinclass: commodClass.maxposinclass,
          id: commodClass.commodclassid,
        }))
      );

      console.log("📦 Seeding Commods...");
      await Commod.bulkCreate(
        commodsData.commods.map((commod) => ({
          id: commod.commodid,
          commodname: commod.commodname,
          unitmass: commod.unitmass / 1000,
          unitvolume: commod.unitvolume / 1000,
          emeraldtax: getTax(taxDataMap["Emerald"], commod.commodname),
          meridiantax: getTax(taxDataMap["Meridian"], commod.commodname),
          ceruleantax: getTax(taxDataMap["Cerulean"], commod.commodname),
          commodclassid: commod.commodclassid,
        }))
      );

      console.log("🍲 Seeding Recipes");
      for (const [key, recipes] of Object.entries(recipeDataMap)) {
        const category = key.toLowerCase();

        for (const recipe of recipes) {
          const createdRecipe = await Recipe.create({
            type: category,
            item: recipe.item,
            units: recipe.units,
            doubloons: recipe.doubloons,
            basic:
              recipe.labor.find((recipe) => recipe.type === "Basic")?.units ||
              0,
            skilled:
              recipe.labor.find((recipe) => recipe.type === "Skilled")?.units ||
              0,
            expert:
              recipe.labor.find((recipe) => recipe.type === "Expert")?.units ||
              0,
          });

          for (const commodity of recipe.commodities) {
            const commod = await Commod.findOne({
              where: { commodname: commodity.resource },
            });
            if (commod) {
              await createdRecipe.addCommod(commod, {
                through: { units: commodity.units },
              });
            } else {
              console.log(
                `Commod: ${commodity.resource} not found in Commod database.`
              );
            }
          }
        }
      }

      console.log("🚢 Seeding Vessels...");
      await Vessel.bulkCreate(vesselData);

      console.log("🏪 Seeding Shoppes...");
      await Shoppe.bulkCreate(shoppesData);

      console.log("--------------------");
      for (const ocean of SQLITE_FILES) {
        console.log(`🌊 Processing ${ocean.name} data...`);
        const data = await extractSQLiteData(ocean.path);
        const oceanId = oceanMap[ocean.name];
        const oceanPrefix = ocean.name.charAt(0).toUpperCase();

        console.log("🏝️ Seeding Islands...");
        const islands_with_additional_data = getIslandsFromArchipelago(
          archipelagoDataMap[ocean.name]
        );

        const getAdditionalData = (islandName) =>
          islands_with_additional_data.find(
            (i) => i.name.toLowerCase() === islandName.toLowerCase()
          ) || {};

        const islands = data.islands.map((island) => {
          const additionalData = getAdditionalData(island.islandname);
          return {
            id: `${oceanPrefix}${island.islandid}`,
            islandname: island.islandname,
            archipelago: island.archipelago,
            link: additionalData.link || "",
            size: additionalData.size || "",
            islandType: additionalData.islandType || "",
            population: additionalData.population || 0,
            governor: additionalData.governor || "",
            governor_link: additionalData.governor_link || "",
            property_tax: additionalData.property_tax || "",
            flag: additionalData.flag || "",
            flag_link: additionalData.flag_link || "",
            oceanId,
          };
        });
        await Island.bulkCreate(islands);

        const insertedIslands = await Island.findAll({ where: { oceanId } });

        for (const island of insertedIslands) {
          const additionalData = getAdditionalData(island.islandname);
          if (additionalData.spawns && Array.isArray(additionalData.spawns)) {
            for (const commodName of additionalData.spawns) {
              // Some weird data got in here
              if (
                commodName.toLowerCase() === "market" ||
                commodName.toLowerCase() === "commodities market" ||
                commodName.toLowerCase() === "fort" ||
                commodName.toLowerCase() === "palace" ||
                commodName.toLowerCase() === "gems"
              ) {
                continue;
              }

              const commod = await Commod.findOne({
                where: {
                  commodname:
                    commodName.charAt(0).toUpperCase() + commodName.slice(1),
                },
              });

              if (commod) {
                await island.addSpawns(commod);
              } else {
                console.log(
                  `Commod ${commodName} not found for island ${island.islandname}`
                );
              }
            }
          }
        }

        const islandMap = {};
        insertedIslands.forEach((island) => {
          islandMap[island.id] = island.oceanId;
        });

        console.log("🏪 Seeding Stalls...");
        const stalls = data.stalls.map((stall) => ({
          id: `${oceanPrefix}${stall.stallid}`,
          stallname: stall.stallname,
          islandid: `${oceanPrefix}${stall.islandid}`,
          oceanId,
        }));
        await Stall.bulkCreate(stalls);

        console.log("🛒 Seeding Buys...");
        const buys = data.buys.map((buy) => ({
          id: uuidv4(),
          price: buy.price,
          qty: buy.qty,
          commodid: buy.commodid,
          islandid: `${oceanPrefix}${buy.islandid}`,
          stallid: `${oceanPrefix}${buy.stallid}`,
          oceanId,
        }));
        await Buy.bulkCreate(buys);

        console.log("💰 Seeding Sells...");
        const sells = data.sells.map((sell) => ({
          id: uuidv4(),
          price: sell.price,
          qty: sell.qty,
          commodid: sell.commodid,
          islandid: `${oceanPrefix}${sell.islandid}`,
          stallid: `${oceanPrefix}${sell.stallid}`,
          oceanId,
        }));
        await Sell.bulkCreate(sells);

        console.log("📤 Seeding Uploads...");
        const uploads = data.uploads.map((upload) => ({
          id: uuidv4(),
          timestamp: upload.timestamp,
          islandid: `${oceanPrefix}${upload.islandid}`,
          oceanId,
        }));
        await Upload.bulkCreate(uploads);

        console.log("📏 Seeding Distances");
        const distances = data.distances.map((distance) => ({
          id: uuidv4(),
          aiid: `${oceanPrefix}${distance.aiid}`,
          biid: `${oceanPrefix}${distance.biid}`,
          dist: distance.dist,
        }));
        await Distance.bulkCreate(distances);

        console.log("🛤️ Seeding Routes");
        const routes = data.routes.map((route) => ({
          id: uuidv4(),
          aiid: `${oceanPrefix}${route.aiid}`,
          biid: `${oceanPrefix}${route.biid}`,
          dist: route.dist,
        }));
        await Route.bulkCreate(routes);

        console.log("--------------------");
      }

      console.log("✅ Seeding Complete!");
    } catch (error) {
      console.error("❌ Seeding Error:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Uploads", null, {});
    await queryInterface.bulkDelete("Buys", null, {});
    await queryInterface.bulkDelete("Sells", null, {});
    await queryInterface.bulkDelete("Stalls", null, {});
    await queryInterface.bulkDelete("Islands", null, {});
    await queryInterface.bulkDelete("Commods", null, {});
    await queryInterface.bulkDelete("CommodClasses", null, {});
    await queryInterface.bulkDelete("Oceans", null, {});
    await queryInterface.bulkDelete("Vessel", null, {});
  },
};
