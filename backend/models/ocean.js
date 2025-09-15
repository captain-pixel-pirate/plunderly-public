"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Ocean extends Model {
    static associate(models) {
      Ocean.hasMany(models.Island, {
        foreignKey: "oceanId",
        onDelete: "CASCADE",
      });
      Ocean.hasMany(models.Stall, {
        foreignKey: "oceanId",
        onDelete: "CASCADE",
      });
      Ocean.hasMany(models.Buy, { foreignKey: "oceanId", onDelete: "CASCADE" });
      Ocean.hasMany(models.Sell, {
        foreignKey: "oceanId",
        onDelete: "CASCADE",
      });
      Ocean.hasMany(models.Upload, {
        foreignKey: "oceanId",
        onDelete: "CASCADE",
      });
    }
  }

  Ocean.init(
    {
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
    },
    {
      sequelize,
      modelName: "Ocean",
    }
  );

  return Ocean;
};
