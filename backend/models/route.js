"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Route extends Model {
    static associate(models) {
      Route.belongsTo(models.Island, { foreignKey: "aiid", as: "IslandA" });
      Route.belongsTo(models.Island, { foreignKey: "biid", as: "IslandB" });
    }
  }

  Route.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      aiid: {
        type: DataTypes.STRING,
        allowNull: false,
        references: { model: "Islands", key: "id" },
      },
      biid: {
        type: DataTypes.STRING,
        allowNull: false,
        references: { model: "Islands", key: "id" },
      },
      dist: { type: DataTypes.INTEGER, allowNull: false },
    },
    { sequelize, modelName: "Route" }
  );

  return Route;
};
