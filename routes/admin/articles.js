const express = require('express');
const router = express.Router();
const {Article} = require('../../models')
const {Op} = require('sequelize') //模糊查询要用到的包
const {NotFoundError} = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');//自定义的工具类

//查询文章列表
//因为app.js中写的是app.use('/admin/articles')这个路径，所以路由处理写'/'就是/admin/articles的网址入口
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
            where: {}, // 先初始化空的where对象，防止后续多个where覆写
            order: [['id', 'DESC']],
            limit: pageSize,
            offset: offset
        }

        //处理title模糊查询
        if (query.title) {
            condition.where.title = {
                [Op.like]: `%${query.title}%`
            }
        }

        //这个函数有两个返回结果，count是查询出来的数据总数，rows是查询出来的数据
        const {count, rows} = await Article.findAndCountAll(condition)

        //使用自定义的请求成功函数（查询成功的状态码默认是200，所以这里不用写）
        success(res, '查询文章列表成功。', {
            articles: rows,
            total: count,
            currentPage,
            pageSize,
        })
    } catch (error) {
        failure(res, error)
    }
});

//根据id查询文章详情
router.get('/:id', async function (req, res, next) {
    try {
        //使用自定义的公共查询方法
        const article = await getArticle(req)

        //使用自定义的请求成功函数
        success(res, '查询文章详情成功。', {article})

    } catch (error) {
        failure(res, error)
    }
})

//创建文章
router.post('/', async function (req, res, next) {
    try {
        //白名单过滤
        const body = filterBody(req)

        const article = await Article.create(body)

        //使用自定义的请求成功函数(201表示成功，且创建了新的资源)
        success(res, '创建文章成功。', {article}, 201)

    } catch (error) {
        failure(res, error)
    }
});

//删除文章
router.delete('/:id', async function (req, res, next) {
    try {
        //自定义的公共查询方法
        const article = await getArticle(req)

        await article.destroy()

        //使用自定义的请求成功函数，删除成功所以不需要data了
        success(res, '删除文章成功。')

    } catch (error) {
        failure(res, error)
    }
})

//更新文章
router.put('/:id', async function (req, res, next) {
    try {
        //自定义的公共查询方法
        const article = await getArticle(req)

        //白名单过滤
        const body = filterBody(req)

        await article.update(body)

        //使用自定义的请求成功函数
        success(res, '更新文章成功。', {article})

    } catch (error) {
        failure(res, error)
    }
    r
})

/**
 * 公共方法：查询当前文章
 * @param req
 * @returns {Promise<Model|null>}
 */
async function getArticle(req) {
    //获取文章id
    const {id} = req.params

    //根据主键查询articles表的指定信息
    const article = await Article.findByPk(id)

    //如果没有找到，就抛出异常
    if (!article) {
        throw new NotFoundError(`ID: ${id} 的文章未找到。`)
    }
    return article

}

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{title: *, content: string|string|DocumentFragment|*}}
 */
function filterBody(req) {
    return {
        title: req.body.title,
        content: req.body.content
    }
}


module.exports = router;
