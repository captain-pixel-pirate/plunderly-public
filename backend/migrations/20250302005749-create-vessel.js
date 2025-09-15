"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Vessels", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      size: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mass: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      volume: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      cannonSize: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      maxPirates: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      maxSwabbies: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      movesPerTurn: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      shotsPerMove: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      maxPillageDamage: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      maxSinkDamage: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      rockDamage: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      ramDamage: {
        type: Sequelize.JSON,
        allowNull: false,
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
    await queryInterface.dropTable("Vessels");
  },
};
