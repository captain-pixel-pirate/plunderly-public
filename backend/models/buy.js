"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Buy extends Model {
    static associate(models) {
      Buy.belongsTo(models.Ocean, { foreignKey: "oceanId" });
      Buy.belongsTo(models.Commod, { foreignKey: "commodid", as: "commod" });
      Buy.belongsTo(models.Island, { foreignKey: "islandid", as: "island" });
      Buy.belongsTo(models.Stall, { foreignKey: "stallid", as: "stall" });
    }
  }

  Buy.init(
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
      modelName: "Buy",
    }
  );

  return Buy;
};
