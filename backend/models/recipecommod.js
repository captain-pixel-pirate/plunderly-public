"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RecipeCommod extends Model {
    static associate(models) {}
  }

  RecipeCommod.init(
    {
      recipeId: {
        type: DataTypes.INTEGER,
        references: { model: "Recipes", key: "id" },
        allowNull: false,
      },
      commodId: {
        type: DataTypes.INTEGER,
        references: { model: "Commods", key: "id" },
        allowNull: false,
      },
      units: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "RecipeCommod",
    }
  );

  return RecipeCommod;
};
