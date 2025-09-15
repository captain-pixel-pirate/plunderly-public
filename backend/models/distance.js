"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Distance extends Model {
    static associate(models) {
      Distance.belongsTo(models.Island, { foreignKey: "aiid", as: "IslandA" });
      Distance.belongsTo(models.Island, { foreignKey: "biid", as: "IslandB" });
    }
  }

  Distance.init(
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
    { sequelize, modelName: "Distance" }
  );

  return Distance;
};
