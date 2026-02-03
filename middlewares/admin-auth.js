const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { UnauthorizedError } = require('../utils/errors');
const { success, failure } = require('../utils/responses');

module.exports = async (req, res, next) => {
    try {
        //判读token是否存在
        const { token } = req.headers;
        if (!token) {
            throw new UnauthorizedError('当前接口需要认证才能访问。');
        }
        //验证token是否正确
        const decoded = jwt.verify(token, process.env.SECRET);

        //从token中解析出的是利用JWT加密前的数据，参数名称和加密时定义的一致
        const { userId } = decoded;

        const user = await User.findByPk(userId);
        if (!user) {
            throw new UnauthorizedError('用户不存在。');
        }
        if(user.role!==100){
            throw new UnauthorizedError('您没有权限使用当前接口。')
        }
        //如果通过验证，将user对象挂载到req上，方便后续中间件或路由使用
        req.user = user;

        //一定要加上next()，才能继续进入到后续中间件或路由
        next();

    } catch (error) {
        failure(res, error);
    }
};