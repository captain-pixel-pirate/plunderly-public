"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Stalls", {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      stallname: {
        type: Sequelize.STRING,
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
      islandid: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Islands",
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
    await queryInterface.dropTable("Stalls");
  },
};
