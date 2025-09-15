"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Island extends Model {
    static associate(models) {
      Island.belongsTo(models.Ocean, { foreignKey: "oceanId" });
      Island.hasMany(models.Stall, { foreignKey: "islandid", as: "stalls" });
      Island.hasMany(models.Upload, { foreignKey: "islandid", as: "uploads" });
      Island.hasMany(models.Buy, { foreignKey: "islandid", as: "buys" });
      Island.hasMany(models.Sell, { foreignKey: "islandid", as: "sells" });
      Island.belongsToMany(models.Commod, {
        through: models.IslandCommod,
        as: "spawns",
        foreignKey: "islandId",
      });
    }
  }

  Island.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      islandname: { type: DataTypes.STRING, allowNull: false },
      archipelago: { type: DataTypes.STRING, allowNull: false },
      link: { type: DataTypes.STRING },
      size: { type: DataTypes.STRING },
      islandType: { type: DataTypes.STRING },
      population: { type: DataTypes.INTEGER },
      governor: { type: DataTypes.STRING },
      governor_link: { type: DataTypes.STRING },
      property_tax: { type: DataTypes.STRING },
      flag: { type: DataTypes.STRING },
      flag_link: { type: DataTypes.STRING },
    },
    {
      sequelize,
      modelName: "Island",
    }
  );

  return Island;
};
