"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Buys", {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      qty: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      oceanId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Oceans",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      commodid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Commods",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      islandid: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Islands",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      stallid: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Stalls",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Buys");
  },
};
