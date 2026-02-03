/**
 * 自定义400错误
 */
class BadRequestError extends Error {
    //构造函数，创建 NotFoundError 实例时会调用它；
    constructor(message) {
        //作用是把 message 传递给父类，让实例拥有 message 属性（比如 error.message 就能拿到传入的提示文本）
        super(message);
        //原生 Error 实例的 name 默认是 'Error'，这里改成 'NotFoundError'，能让你在捕获错误时快速识别错误类型（比如 if (error.name === 'NotFoundError')）
        this.name = 'BadRequestError';
    }
}

/**
 * 自定义 401 错误类
 */
class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

/**
 * 自定义404错误
 */
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
    }
}

module.exports = {
    BadRequestError,
    UnauthorizedError,
    NotFoundError
}