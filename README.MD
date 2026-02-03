## 长乐未央 API
此项目为长乐未央公司开发的，专供学习`Node.js`的同学使用。项目使用了 Node.js + Express + MySQL + Sequelize ORM 开发。

我们一起从零基础开始，学习接口开发，先从最基础的项目搭建、数据库的入门，再到完整的真实项目开发，一步步的和大家一起完成一个真实的项目。

## npm包记录
`npm i -g express-generator`	安装express-generator脚手架，用于自动生成框架

`express --no-view`	在文件夹下自动生成express框架代码 --no-view的意思是不需要任何视图模板，因为这个项目是专门做后端接口的。记得删除public目录下的index.html

`npm i`	自动安装上述框架需要的依赖

`npm i -g nodemon`	启动命令用的包，更新代码时可自动重启服务端。安装后记得配置“package.json”中的“start”，改为“nodemon ./bin/www”

`npm i -g sequelize-cli`	安装sequelize命令行工具

`npm i sequelize mysql2`	安装sequelize与mysql依赖包

`sequelize init`	初始化sequelize，会在项目中生成四个文件夹，config(数据库连接配置)，migrations(迁移文件)，models(模型文件)，seeders(种子文件)

`npm i bcryptjs`	加密算法包，用于对用户密码进行加密存储

`npm i jsonwebtoken`	用JWT包，生成TOKEN，相当于身份验证令牌

`npm i dotenv`	作用是从 .env 文件中加载环境变量，并注入到 process.env 中，可以在代码里安全地使用环境变量

`npm i cors`	解决跨域问题专用包

`npm i multer` 安装multer依赖包，Express框架专用的处理文件上传的依赖包

## sequelize指令
`sequelize model:generate --name Category --attributes name:string,rank:integer` 	创建模型和迁移文件，字段名要和数据库中的Users表一一对应，注意模型名称为单数，数据库表名会自动生成复数（id是自动生成的，不用写）。注意在models中添加数据验证。

`sequelize db:migrate`	运行migrations中的所有迁移文件，会把已经创建好的模型文件，执行一下，在数据库中生成表(已执行过的不会再运行)。注意执行之前要在迁移文件中更改每个字段的属性，确保符合数据库设计需求。

`sequelize seed:generate --name article`	新建种子文件(用于批量测试)，执行后在seeds目录能看到，up是填充数据，down是反向操作

`sequelize db:seed --seed 文件名(不要后缀)`	运行指定的种子文件

`sequelize db:seed:all`	运行所有种子文件(之前运行过的也会运行一次，只适合数据库为空时使用)

`sequelize db:migrate:undo`	回滚上一次的迁移，也就是删掉之前新增的表。用于需要更改模型字段时，重新运行迁移文件。（回滚时运行的是迁移文件中的down函数）

`sequelize migration:create --name add-avatar-to-user`	新建一个迁移文件，用于为数据库添加字段。但要记得在模型中手动添加字段
