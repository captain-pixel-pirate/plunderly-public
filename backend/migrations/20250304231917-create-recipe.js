"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Recipes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      item: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      units: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      doubloons: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      basic: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      skilled: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      expert: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Recipes");
  },
};
