"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Stall extends Model {
    static associate(models) {
      Stall.belongsTo(models.Ocean, {
        foreignKey: "oceanId",
        onDelete: "CASCADE",
      });
      Stall.belongsTo(models.Island, { foreignKey: "islandid" });
      Stall.hasMany(models.Buy, { foreignKey: "stallid" });
      Stall.hasMany(models.Sell, { foreignKey: "stallid" });
    }
  }

  Stall.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      stallname: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: "Stall",
    }
  );

  return Stall;
};
