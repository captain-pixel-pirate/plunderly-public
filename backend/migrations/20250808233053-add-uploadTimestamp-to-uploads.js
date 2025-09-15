"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Uploads");
    if (!table.uploadTimestamp) {
      await queryInterface.addColumn("Uploads", "uploadTimestamp", {
        type: Sequelize.BIGINT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("Uploads");
    if (table.uploadTimestamp) {
      await queryInterface.removeColumn("Uploads", "uploadTimestamp");
    }
  },
};
