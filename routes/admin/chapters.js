const express = require('express');
const router = express.Router();
const {Chapter, Course} = require('../../models')
const {Op} = require('sequelize') //模糊查询要用到的包
const {NotFound,BadRequest} = require('http-errors');
const { success, failure } = require('../../utils/responses');//自定义的工具类

//查询章节列表
//因为app.js中写的是app.use('/admin/chapters')这个路径，所以路由处理写'/'就是/admin/chapters的网址入口
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

        if(!query.courseId){
            throw new BadRequest('获取章节列表失败，课程ID不能为空')
        }

        //定义查询条件：按照id倒序排序，同时指定条数和页码
        const condition = {
            ...getCondition(),
            where: {}, // 先初始化空的where对象，防止后续多个where覆写
            order: [['rank', 'ASC'],['id', 'ASC']],
            limit: pageSize,
            offset: offset
        }

        if (query.courseId) {
            condition.where.courseId = {
                [Op.eq]: query.courseId
            }
        }
        //模糊查询
        if (query.title) {
            condition.where.title = {
                [Op.like]: `%${query.title}%`
            }
        }

        //这个函数有两个返回结果，count是查询出来的数据总数，rows是查询出来的数据
        const {count, rows} = await Chapter.findAndCountAll(condition)

        //使用自定义的请求成功函数（查询成功的状态码默认是200，所以这里不用写）
        success(res, '查询章节列表成功。', {
            chapters: rows,
            total: count,
            currentPage,
            pageSize,
        })
    } catch (error) {
        failure(res, error)
    }
});

//根据id查询章节详情
router.get('/:id', async function (req, res, next) {
    try {
        //使用自定义的公共查询方法
        const chapter = await getChapter(req)

        //使用自定义的请求成功函数
        success(res, '查询章节详情成功。', {chapter})

    } catch (error) {
        failure(res, error)
    }
})

//创建章节
router.post('/', async function (req, res, next) {
    try {
        //白名单过滤
        const body = filterBody(req)

        const chapter = await Chapter.create(body)

        //使用自定义的请求成功函数(201表示成功，且创建了新的资源)
        success(res, '创建章节成功。', {chapter}, 201)

    } catch (error) {
        failure(res, error)
    }
});

//删除章节
router.delete('/:id', async function (req, res, next) {
    try {
        //自定义的公共查询方法
        const chapter = await getChapter(req)

        await chapter.destroy()

        //使用自定义的请求成功函数，删除成功所以不需要data了
        success(res, '删除章节成功。')

    } catch (error) {
        failure(res, error)
    }
})

//更新章节
router.put('/:id', async function (req, res, next) {
    try {
        //自定义的公共查询方法
        const chapter = await getChapter(req)

        //白名单过滤
        const body = filterBody(req)

        await chapter.update(body)

        //使用自定义的请求成功函数
        success(res, '更新章节成功。', {chapter})

    } catch (error) {
        failure(res, error)
    }
    r
})

/**
 * 公共方法：关联课程数据
 * @returns {{attributes: {exclude: string[]}, include: [{model: *, as: string, attributes: string[]},{model: *, as: string, attributes: string[]}]}}
 */
function getCondition() {
    return  {
        attributes: {exclude: ['CourseId']}, //排除查询结果中大写的CategoryId和UserId
        include: [
            {
                model: Course,
                as: 'course',
                attributes: ['id', 'name'] //限定查出来的关联数据只有这两个字段
            }
        ]
    }
}

/**
 * 公共方法：查询当前章节
 * @param req
 * @returns {Promise<Model|null>}
 */
async function getChapter(req) {
    //获取章节id
    const {id} = req.params

    const condition = getCondition()
    //根据主键查询chapters表的指定信息
    const chapter = await Chapter.findByPk(id,condition)

    //如果没有找到，就抛出异常
    if (!chapter) {
        throw new NotFound(`ID: ${id} 的章节未找到。`)
    }
    return chapter

}

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{courseId: number|*, title: *, content: *, video: string|boolean|MediaTrackConstraints|KeySystemTrackConfiguration|VideoConfiguration|*, rank: number|*}}
 */
function filterBody(req) {
    return {
        courseId: req.body.courseId,
        title: req.body.title,
        content: req.body.content,
        video: req.body.video,
        rank: req.body.rank
    };
}


module.exports = router;
