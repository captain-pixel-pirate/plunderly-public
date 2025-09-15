"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Uploads", {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      timestamp: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("Uploads");
  },
};
