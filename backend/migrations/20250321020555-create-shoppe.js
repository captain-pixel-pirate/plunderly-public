"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Shoppes", {
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
      imagePath: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      grade: {
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
      maxLaborThroughput: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      basicLaborCap: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      skilledLaborCap: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      expertLaborCap: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      construction: {
        type: Sequelize.JSON,
        allowNull: true,
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Shoppes");
  },
};
