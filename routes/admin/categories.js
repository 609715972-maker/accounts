const express = require('express');
const router = express.Router();
const {Category,Course} = require('../../models')
const {Op} = require('sequelize') //模糊查询要用到的包
const {NotFoundError} = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');//自定义的工具类

//查询分类列表
//因为app.js中写的是app.use('/admin/categories')这个路径，所以路由处理写'/'就是/admin/categories的网址入口
router.get('/', async function (req, res, next) {
    try {
        //取出query参数，针对非id查询
        const query = req.query

        //当前是第几页。||的意思是默认值，如果没传这个参数，默认查询第一页
        const currentPage = Math.abs(Number(query.currentPage)) || 1
        //每页显示多少条数据。||的意思是默认值，如果没传这个参数，默认每页10条
        const pageSize = Math.abs(Number(query.pageSize)) || 10
        //计算offset，这个参数是SQL语句中，从第几条数据开始显示的意思
        const offset = (currentPage - 1) * pageSize

        //定义查询条件：按照id倒序排序，同时指定条数和页码
        const condition = {
            order: [['rank', 'ASC'],['id', 'ASC']],
            limit: pageSize,
            offset: offset
        }

        //处理name模糊查询
        if (query.name) {
            condition.where = {
                name: {
                    [Op.like]: `%${query.name}%`
                }
            }
        }

        //这个函数有两个返回结果，count是查询出来的数据总数，rows是查询出来的数据
        const { count, rows } = await Category.findAndCountAll(condition)

        //使用自定义的请求成功函数（查询成功的状态码默认是200，所以这里不用写）
        success(res, '查询分类列表成功。', {
            categories: rows,
            total: count,
            currentPage,
            pageSize,
        })
    } catch (error) {
        failure(res, error)
    }
});

//根据id查询分类详情
router.get('/:id', async function (req, res, next) {
    try {
        //使用自定义的公共查询方法
        const category = await getCategory(req)

        //使用自定义的请求成功函数
        success(res, '查询分类详情成功。', {category})

    } catch (error) {
        failure(res, error)
    }
})

//创建分类
router.post('/', async function (req, res, next) {
    try {
        //白名单过滤
        const body = filterBody(req)

        const category = await Category.create(body)

        //使用自定义的请求成功函数(201表示成功，且创建了新的资源)
        success(res, '创建分类成功。', {category}, 201)

    } catch (error) {
        failure(res, error)
    }
});

//删除分类
router.delete('/:id', async function (req, res, next) {
    try {
        //自定义的公共查询方法
        const category = await getCategory(req)

        //约束，防止删除某个分类时，分类下的课程全都找不到这个分类了
        const count = await Course.count({ where: { categoryId: req.params.id } });
        if (count > 0) {
            throw new Error('当前分类有课程，无法删除。');
        }

        await category.destroy()

        //使用自定义的请求成功函数，删除成功所以不需要data了
        success(res, '删除分类成功。')

    } catch (error) {
        failure(res, error)
    }
})

//更新分类
router.put('/:id', async function (req, res, next) {
    try {
        //自定义的公共查询方法
        const category = await getCategory(req)

        //白名单过滤
        const body = filterBody(req)

        await category.update(body)

        //使用自定义的请求成功函数
        success(res, '更新分类成功。', {category})

    } catch (error) {
        failure(res, error)
    }

})

/**
 * 公共方法：查询当前分类
 * @param req
 * @returns {Promise<Model|null>}
 */
async function getCategory(req) {
    //获取分类id
    const {id} = req.params

    //根据主键查询categories表的指定信息
    const category = await Category.findByPk(id)

    //如果没有找到，就抛出异常
    if (!category) {
        throw new NotFoundError(`ID: ${id} 的分类未找到。`)
    }
    return category

}

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{name: *, rank: number|*}}
 */
function filterBody(req) {
    return {
        name: req.body.name,
        rank: req.body.rank
    }
}


module.exports = router;
