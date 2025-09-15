"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Shoppe extends Model {
    static associate(models) {}
  }

  Shoppe.init(
    {
      type: { type: DataTypes.STRING, allowNull: false },
      imagePath: { type: DataTypes.STRING, allowNull: false },
      grade: { type: DataTypes.STRING, allowNull: false },
      mass: { type: DataTypes.INTEGER, allowNull: false },
      volume: { type: DataTypes.INTEGER, allowNull: false },
      maxLaborThroughput: { type: DataTypes.INTEGER, allowNull: false },
      basicLaborCap: { type: DataTypes.INTEGER, allowNull: false },
      skilledLaborCap: { type: DataTypes.INTEGER, allowNull: false },
      expertLaborCap: { type: DataTypes.INTEGER, allowNull: false },
      construction: { type: DataTypes.JSON, allowNull: true },
    },
    {
      sequelize,
      modelName: "Shoppe",
    }
  );

  return Shoppe;
};
