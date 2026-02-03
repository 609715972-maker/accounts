const express = require('express');
const router = express.Router();
const {Setting} = require('../../models')
const {NotFoundError} = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');//自定义的工具类

/**
 * 查询系统设置详情
 */
router.get('/', async function (req, res, next) {
    try {
        //使用自定义的公共查询方法
        const setting = await getSetting()

        //使用自定义的请求成功函数
        success(res, '查询系统设置详情成功。', {setting})

    } catch (error) {
        failure(res, error)
    }
})

/**
 * 更新系统设置
 */
router.put('/', async function (req, res, next) {
    try {
        //自定义的公共查询方法
        const setting = await getSetting()

        //白名单过滤
        const body = filterBody(req)

        await setting.update(body)

        //使用自定义的请求成功函数
        success(res, '更新系统设置成功。', {setting})

    } catch (error) {
        failure(res, error)
    }

})

/**
 * 公共方法：查询当前系统设置
 * @returns {Promise<Model|null>}
 */
async function getSetting() {
    //查询数据库中符合条件的第一条记录
    const setting = await Setting.findOne()

    //如果没有找到，就抛出异常
    if (!setting) {
        throw new NotFoundError(`初始系统设置未找到，请运行种子文件。`)
    }
    return setting

}

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{name: *, icp: string|string|DocumentFragment|*, copyright: string|*}}
 */
function filterBody(req) {
    return {
        name: req.body.name,
        icp: req.body.content,
        copyright: req.body.copyright,
    }
}


module.exports = router;
