'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Courses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      categoryId: {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.STRING
      },
      recommended: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED
      },
      introductory: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      content: {
        type: Sequelize.TEXT
      },
      likesCount: {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: 0
      },
      chaptersCount: {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex('Courses', {
      fields: ['categoryId']
    })
    await queryInterface.addIndex('Courses', {
      fields: ['userId']
    })
    await queryInterface.addIndex('Courses', {
      fields: ['recommended']
    })
    await queryInterface.addIndex('Courses', {
      fields: ['introductory']
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Courses');
  }
};