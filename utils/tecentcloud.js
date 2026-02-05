const COS = require('cos-nodejs-sdk-v5');
const {v4: uuidv4} = require('uuid');

//初始化腾讯云COS客户端
const cos = new COS({
    SecretId: process.env.TENCENT_SECRETID,
    SecretKey: process.env.TENCENT_SECRETKEY
})

/**
 * 上传到腾讯云
 * @param file
 * @param options
 * @returns {Promise<{fileUrl: string, fileName: string, cosResult: unknown}>}
 */
async function uploadToCos(file, options = {}) {
    // 参数中的options为存储路径，不写默认为uploads/
    const prefix = options.prefix || 'uploads/';

    // 用UUID包生成唯一文件名，去掉连接符号更简洁
    const uniqueId = uuidv4().replace(/-/g, '');
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uniqueId}.${fileExt}`;

    // 构造上传参数
    const uploadParams = {
        Bucket: process.env.TENCENT_BUCKET,
        Region: process.env.TENCENT_REGION,
        Key: `${prefix}${fileName}`, // 上传路径+文件名
        Body: file.buffer, // 文件流（Buffer）
        ContentType: file.mimetype // 文件MIME类型
    };

    // 上传到 COS（包装为 Promise 适配 async/await）
    const cosResult = await new Promise((resolve, reject) => {
        cos.putObject(uploadParams, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });

    // 构造文件访问 URL
    const fileUrl = `https://${uploadParams.Bucket}.cos.${uploadParams.Region}.myqcloud.com/${uploadParams.Key}`;

    return {
        fileUrl,
        fileName,
        cosResult
    };
}

module.exports = {
    uploadToCos
};

// function fileFilter(req, file, callback)  {
//     const fileType = file.mimeType.split('/')[0]
//     const isImage = fileType === 'image'
//     if(!isImage){
//         return callback(null, false);//要改的
//     }
//     callback(null, true);//要改的
// }