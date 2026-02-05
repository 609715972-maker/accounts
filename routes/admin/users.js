const express = require('express');
const router = express.Router();
const {User} = require('../../models')
const {Op} = require('sequelize') //模糊查询要用到的包
const {NotFound} = require('http-errors');
const { success, failure } = require('../../utils/responses');//自定义的工具类

//查询用户列表
//因为app.js中写的是app.use('/admin/users')这个路径，所以路由处理写'/'就是/admin/users的网址入口
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

        //模糊查询
        if (query.email) {
            condition.where.email = {
                [Op.like]: `%${query.email}%`
            }
        }
        if (query.username) {
            condition.where.username = {
                [Op.like]: `%${query.username}%`
            }
        }
        if (query.nickname) {
            condition.where.nickname = {
                [Op.like]: `%${query.nickname}%`
            }
        }
        if (query.role) {
            condition.where.role = {
                [Op.like]: `%${query.role}%`
            }
        }

        //这个函数有两个返回结果，count是查询出来的数据总数，rows是查询出来的数据
        const {count, rows} = await User.findAndCountAll(condition)

        //使用自定义的请求成功函数（查询成功的状态码默认是200，所以这里不用写）
        success(res, '查询用户列表成功。', {
            users: rows,
            total: count,
            currentPage,
            pageSize,
        })
    } catch (error) {
        failure(res, error)
    }
});

//根据id查询用户详情
router.get('/:id', async function (req, res, next) {
    try {
        //使用自定义的公共查询方法
        const user = await getUser(req)

        //使用自定义的请求成功函数
        success(res, '查询用户详情成功。', {user})

    } catch (error) {
        failure(res, error)
    }
})

//创建用户
router.post('/', async function (req, res, next) {
    try {
        //白名单过滤
        const body = filterBody(req)

        const user = await User.create(body)

        //使用自定义的请求成功函数(201表示成功，且创建了新的资源)
        success(res, '创建用户成功。', {user}, 201)

    } catch (error) {
        failure(res, error)
    }
});

//更新用户
router.put('/:id', async function (req, res, next) {
    try {
        //自定义的公共查询方法
        const user = await getUser(req)

        //白名单过滤
        const body = filterBody(req)

        await user.update(body)

        //使用自定义的请求成功函数
        success(res, '更新用户成功。', {user})

    } catch (error) {
        failure(res, error)
    }

})

/**
 * 公共方法：查询当前用户
 * @param req
 * @returns {Promise<Model|null>}
 */
async function getUser(req) {
    //获取用户id
    const {id} = req.params

    //根据主键查询users表的指定信息
    const user = await User.findByPk(id)

    //如果没有找到，就抛出异常
    if (!user) {
        throw new NotFound(`ID: ${id} 的用户未找到。`)
    }
    return user

}

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{title: *, content: string|string|DocumentFragment|*}}
 */
function filterBody(req) {
    return {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        nickname: req.body.nickname,
        sex: req.body.sex,
        company: req.body.company,
        introduce: req.body.introduce,
        role: req.body.role,
        avatar: req.body.avatar
    }
}


module.exports = router;
