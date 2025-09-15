"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Commod extends Model {
    static associate(models) {
      Commod.belongsToMany(models.Recipe, {
        through: models.RecipeCommod,
        foreignKey: "commodId",
      });
      Commod.belongsToMany(models.Island, {
        through: models.IslandCommod,
        foreignKey: "commodId",
      });
      Commod.belongsTo(models.CommodClass, {
        foreignKey: "commodclassid",
        as: "commodclass",
      });
      Commod.hasMany(models.Buy, {
        foreignKey: "commodid",
        onDelete: "CASCADE",
      });
      Commod.hasMany(models.Sell, {
        foreignKey: "commodid",
        onDelete: "CASCADE",
      });
    }
  }

  Commod.init(
    {
      commodname: { type: DataTypes.STRING, allowNull: false },
      unitmass: { type: DataTypes.INTEGER, allowNull: false },
      unitvolume: { type: DataTypes.INTEGER, allowNull: false },
      emeraldtax: { type: DataTypes.DECIMAL(10, 1), allowNull: false },
      ceruleantax: { type: DataTypes.DECIMAL(10, 1), allowNull: false },
      meridiantax: { type: DataTypes.DECIMAL(10, 1), allowNull: false },
    },
    {
      sequelize,
      modelName: "Commod",
    }
  );

  return Commod;
};
