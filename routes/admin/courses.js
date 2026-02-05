const express = require('express');
const router = express.Router();
const {Course, Category, User,Chapter} = require('../../models')
const {Op} = require('sequelize') //模糊查询要用到的包
const {NotFound,Conflict} = require('http-errors');
const { success, failure } = require('../../utils/responses');//自定义的工具类

//查询课程列表
//因为app.js中写的是app.use('/admin/courses')这个路径，所以路由处理写'/'就是/admin/courses的网址入口
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

        //定义查询条件
        const condition = {
            ...getCondition(), //解构语法要求，必须加...
            where: {}, // 先初始化空的where对象，防止后续多个where覆写
            order: [['id', 'DESC']],
            limit: pageSize,
            offset: offset
        }

        //模糊查询
        if (query.categoryId) {
            condition.where.categoryId = {
                [Op.eq]: query.categoryId
            }
        }
        if (query.userId) {
            condition.where.userId = {
                [Op.eq]: query.userId
            }
        }
        if (query.name) {
            condition.where.name = {
                [Op.like]: `%${query.name}%`
            }
        }
        if (query.recommended) {
            condition.where.recommended = {
                [Op.eq]: query.recommended === 'true'
            }
        }
        if (query.introductory) {
            condition.where.introductory = {
                [Op.eq]: query.introductory === 'true'
            }
        }

        //这个函数有两个返回结果，count是查询出来的数据总数，rows是查询出来的数据
        const {count, rows} = await Course.findAndCountAll(condition)

        //使用自定义的请求成功函数（查询成功的状态码默认是200，所以这里不用写）
        success(res, '查询课程列表成功。', {
            courses: rows,
            total: count,
            currentPage,
            pageSize,
        })
    } catch (error) {
        failure(res, error)
    }
});

//根据id查询课程详情
router.get('/:id', async function (req, res, next) {
    try {
        //使用自定义的公共查询方法
        const course = await getCourse(req)

        //使用自定义的请求成功函数
        success(res, '查询课程详情成功。', {course})

    } catch (error) {
        failure(res, error)
    }
})

//创建课程
router.post('/', async function (req, res, next) {
    try {
        //白名单过滤
        const body = filterBody(req)

        const course = await Course.create(body)

        //使用自定义的请求成功函数(201表示成功，且创建了新的资源)
        success(res, '创建课程成功。', {course}, 201)

    } catch (error) {
        failure(res, error)
    }
});

//删除课程
router.delete('/:id', async function (req, res, next) {
    try {
        //自定义的公共查询方法
        const course = await getCourse(req)

        //约束，防止删除某个课程时，课程下的章节全都找不到这个课程了
        const count = await Chapter.count({ where: { courseId: req.params.id } });
        if (count > 0) {
            throw new Conflict('当前课程有章节，无法删除。');
        }

        await course.destroy()

        //使用自定义的请求成功函数，删除成功所以不需要data了
        success(res, '删除课程成功。')

    } catch (error) {
        failure(res, error)
    }
})

//更新课程
router.put('/:id', async function (req, res, next) {
    try {
        //自定义的公共查询方法
        const course = await getCourse(req)

        //白名单过滤
        const body = filterBody(req)

        await course.update(body)

        //使用自定义的请求成功函数
        success(res, '更新课程成功。', {course})

    } catch (error) {
        failure(res, error)
    }
    r
})

/**
 * 公共方法：关联分类，用户数据
 * @returns {{attributes: {exclude: string[]}, include: [{model: *, as: string, attributes: string[]},{model: *, as: string, attributes: string[]}]}}
 */
function getCondition() {
    return  {
        attributes: {exclude: ['CategoryId', 'UserId']}, //排除查询结果中大写的CategoryId和UserId
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['id', 'name'] //限定查出来的关联数据只有这两个字段
            },
            {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'avatar']
            },
        ]//相当于SQL中的join查询，关联了两张表
    }
}


/**
 * 公共方法：查询当前课程
 * @param req
 * @returns {Promise<Model|null>}
 */
async function getCourse(req) {
    //获取课程id
    const {id} = req.params

    //定义查询条件
    const condition = getCondition()

    //根据主键查询courses表的指定信息
    const course = await Course.findByPk(id,condition)

    //如果没有找到，就抛出异常
    if (!course) {
        throw new NotFound(`ID: ${id} 的课程未找到。`)
    }
    return course

}

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{categoryId: number|*, userId: number|*, name: *, image: *, recommended: boolean|*, introductory: boolean|*, content: string|string|DocumentFragment|*}}
 */
function filterBody(req) {
    return {
        categoryId: req.body.categoryId,
        userId: req.body.userId,
        name: req.body.name,
        image: req.body.image,
        recommended: req.body.recommended,
        introductory: req.body.introductory,
        content: req.body.content
    };
}


module.exports = router;
