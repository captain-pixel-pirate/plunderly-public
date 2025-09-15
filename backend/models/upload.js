"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Upload extends Model {
    static associate(models) {
      Upload.belongsTo(models.Ocean, { foreignKey: "oceanId" });
      Upload.belongsTo(models.Island, { foreignKey: "islandid" });
    }
  }

  Upload.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      timestamp: { type: DataTypes.DATE, allowNull: false },
      uploadTimestamp: {
        type: DataTypes.BIGINT,
        allowNull: true,
        get() {
          const v = this.getDataValue("uploadTimestamp");
          return v == null ? null : Number(v);
        },
      },
    },
    {
      sequelize,
      modelName: "Upload",
    }
  );

  return Upload;
};
