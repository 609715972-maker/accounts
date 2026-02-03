'use strict';

const { QueryInterface } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const articles = []
    const counts = 100
    for (let i = 1; i <= counts; i++) {
      const article = {
        title: `文章的标题${i}`,
        content: `文章的内容${i}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      articles.push(article)
    }
    //把数组articles插入到“Articles”表中
    await queryInterface.bulkInsert('Articles', articles, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Articles', null, {});
  }
};
// 运行种子文件，在命令行中输入sequelize db:seed --seed 20260128154008-article
