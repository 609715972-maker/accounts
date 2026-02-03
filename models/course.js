'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Course extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        //添加关联，将courses表与Categories表，users表关联起来，用“belongsTo”实现join效果,代表Course仅属于一个Category
        //简单规则：有关联字段的表，一定是belongsTo某个表。反之，就是hasMany
        static associate(models) {
            models.Course.belongsTo(models.Category,{as:'category'})
            models.Course.belongsTo(models.User,{as:'user'})
            models.Course.hasMany(models.Chapter,{as:'chapters'})
        }
    }

    Course.init({
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {msg: '分类ID必须填写。'},
                notEmpty: {msg: '分类ID不能为空。'},
                async isPresent(value) {
                    const category = await sequelize.models.Category.findByPk(value) //用到了其它的模型，要加上sequelize.models
                    if (!category) {
                        throw new Error(`ID为：${value} 的分类不存在。`);
                    }
                }//每个课程都属于一个分类，所以加了分类id验证，categoryId必须存在
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {msg: '课程名必须填写。'},
                notEmpty: {msg: '课程名不能为空。'},
                len: {args: [2, 45], msg: '课程名长度必须是2 ~ 45之间。'},
                async isUnique(value) {
                    const course = await Course.findOne({where: {name: value}})
                    if (course) {
                        throw new Error('课程名已存在，请选择其他名称。');
                    }
                }
            }
        },
        image: DataTypes.STRING,
        recommended: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            validate: {
                isIn: {args: [[0, 1]], msg: '是否推荐课程：不推荐：0 推荐：1。'}
            }
        },
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
                }//每个课程都属于一个用户，所以加了分类id验证，UserId必须存在
            }
        },
        introductory: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            validate: {
                isIn: {args: [[0, 1]], msg: '是否入门课程：不推荐：0 推荐：1。'}
            }
        },
        content: DataTypes.TEXT,
        likesCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        chaptersCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    }, {
        sequelize,
        modelName: 'Course',
    });
    return Course;
};