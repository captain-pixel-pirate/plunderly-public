"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CommodClass extends Model {
    static associate(models) {
      CommodClass.hasMany(models.Commod, {
        foreignKey: "commodclassid",
      });
    }
  }

  CommodClass.init(
    {
      commodclass: DataTypes.STRING,
      maxposinclass: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "CommodClass",
    }
  );
  return CommodClass;
};
