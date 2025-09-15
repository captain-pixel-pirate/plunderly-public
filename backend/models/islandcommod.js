"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IslandCommod extends Model {
    static associate(models) {}
  }

  IslandCommod.init(
    {
      islandId: {
        type: DataTypes.STRING,
        primaryKey: true,
        references: {
          model: "Islands",
          key: "id",
        },
      },
      commodId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "Commods",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "IslandCommod",
    }
  );

  return IslandCommod;
};
