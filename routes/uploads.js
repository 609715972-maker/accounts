const express = require('express');
const router = express.Router();
const {success, failure} = require('../utils/responses');
const multer = require('multer')
const {uploadToCos} = require('../utils/tecentcloud');
const {BadRequest} = require('http-errors');

//multer配置
const storage = multer.memoryStorage();// 内存存储，适合小文件；大文件可改用 diskStorage
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB 限制
});
//5 * 1024 * 1024
/**
 * 腾讯云 COS 客户端上传
 * POST /uploads/tencentcloud
 */
router.post('/tencentcloud',upload.single('file'), async function (req, res) {
    try {
        // 校验是否有文件
        if (!req.file) {
            return failure(res, new BadRequest('请选择要上传的文件'))
        }
        //调用工具类上传文件
        const uploadResult = await uploadToCos(req.file, {
            prefix: 'uploads/' //用于自定义存储前缀，比如 'images/' 'docs/'
        });

        success(res, '上传成功。', uploadResult);

    } catch (error) {
        failure(res, error);
    }
})

module.exports = router;