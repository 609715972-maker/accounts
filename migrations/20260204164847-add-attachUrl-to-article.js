'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Articles', 'attachUrl', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('Articles', 'userId', {
      type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Articles', 'attachUrl')
    await queryInterface.removeColumn('Articles', 'userId')
  }
};
