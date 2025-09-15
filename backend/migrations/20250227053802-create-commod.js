"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Commods", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      commodname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      unitmass: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      unitvolume: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      emeraldtax: {
        type: Sequelize.DECIMAL(10, 1),
        allowNull: false,
      },
      ceruleantax: {
        type: Sequelize.DECIMAL(10, 1),
        allowNull: false,
      },
      meridiantax: {
        type: Sequelize.DECIMAL(10, 1),
        allowNull: false,
      },
      commodclassid: {
        type: Sequelize.INTEGER,
        references: {
          model: "CommodClasses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Commods");
  },
};
