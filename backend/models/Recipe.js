"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Recipe extends Model {
    static associate(models) {
      Recipe.belongsToMany(models.Commod, {
        through: models.RecipeCommod,
        foreignKey: "recipeId",
      });
    }
  }

  Recipe.init(
    {
      type: { type: DataTypes.STRING, allowNull: false },
      item: { type: DataTypes.STRING, allowNull: false },
      units: { type: DataTypes.INTEGER, allowNull: false },
      doubloons: { type: DataTypes.INTEGER, allowNull: false },
      basic: { type: DataTypes.INTEGER, allowNull: false },
      skilled: { type: DataTypes.INTEGER, allowNull: false },
      expert: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "Recipe",
    }
  );

  return Recipe;
};
