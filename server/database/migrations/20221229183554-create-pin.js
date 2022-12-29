'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Pins', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pin: {
        type: Sequelize.STRING,
        unique: true,
        index: true,
      },
      points: {
        type: Sequelize.DOUBLE
      },
      userId: {
        type: Sequelize.INTEGER
      },
      store: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      dateUsed: {
        type: Sequelize.DATE
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Pins');
  }
};