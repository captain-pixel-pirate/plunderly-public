"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Sell extends Model {
    static associate(models) {
      Sell.belongsTo(models.Ocean, { foreignKey: "oceanId" });
      Sell.belongsTo(models.Commod, { foreignKey: "commodid", as: "commod" });
      Sell.belongsTo(models.Island, { foreignKey: "islandid", as: "island" });
      Sell.belongsTo(models.Stall, { foreignKey: "stallid", as: "stall" });
    }
  }

  Sell.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      price: { type: DataTypes.INTEGER, allowNull: false },
      qty: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "Sell",
    }
  );

  return Sell;
};
