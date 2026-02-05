'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Article.belongsTo(models.User,{as:'user'})
    }
  }
  Article.init({
    title: {
      type:DataTypes.STRING,
      allowNull: false,
      validate:{
        notNull:{
          msg:'标题必须存在。'
        },
        notEmpty:{
          msg:'标题不能为空。'
        },
        len:{
          args:[2,45],
          msg:'标题长度必须在2 ~ 45个字符之间。'
        }
      }
    },
    content: DataTypes.TEXT,
    attachUrl:DataTypes.TEXT,
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {msg: '用户ID必须填写。'},
        notEmpty: {msg: '用户ID不能为空。'},
        async isPresent(value) {
          const user = await sequelize.models.User.findByPk(value)
          if (!user) {
            throw new Error(`ID为：${value} 的用户不存在。`);
          }
        }
      }
    },
  }, {
    sequelize,
    modelName: 'Article',
  });
  return Article;
};