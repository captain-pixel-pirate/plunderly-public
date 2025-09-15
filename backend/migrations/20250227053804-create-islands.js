"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Islands", {
      id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      islandname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      archipelago: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      link: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      size: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      islandType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      population: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      governor: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      governor_link: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      property_tax: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      flag: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      flag_link: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      oceanId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Oceans",
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
    await queryInterface.dropTable("Islands");
  },
};
