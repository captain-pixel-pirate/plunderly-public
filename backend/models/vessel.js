"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Vessel extends Model {
    static associate(models) {}
  }

  Vessel.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      size: { type: DataTypes.STRING, allowNull: false },
      mass: { type: DataTypes.INTEGER, allowNull: false },
      volume: { type: DataTypes.INTEGER, allowNull: false },
      cannonSize: { type: DataTypes.STRING, allowNull: false },
      maxPirates: { type: DataTypes.INTEGER, allowNull: false },
      maxSwabbies: { type: DataTypes.INTEGER, allowNull: false },
      movesPerTurn: { type: DataTypes.INTEGER, allowNull: false },
      shotsPerMove: { type: DataTypes.INTEGER, allowNull: false },
      maxPillageDamage: { type: DataTypes.JSON, allowNull: false },
      maxSinkDamage: { type: DataTypes.JSON, allowNull: false },
      rockDamage: { type: DataTypes.JSON, allowNull: false },
      ramDamage: { type: DataTypes.JSON, allowNull: false },
    },
    {
      sequelize,
      modelName: "Vessel",
    }
  );

  return Vessel;
};
