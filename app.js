var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config(); //环境变量的包
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const adminAuth = require('./middlewares/admin-auth'); //引用登录中间件，用于验证token
const cors = require('cors'); //解决跨域问题


//后台路由文件(长乐未央)
const adminArticlesRouter = require('./routes/admin/articles');
const adminCategoriesRouter = require('./routes/admin/categories');
const adminSettingsRouter = require('./routes/admin/settings');
const adminUsersRouter = require('./routes/admin/users');
const adminCoursesRouter = require('./routes/admin/courses');
const adminChapterRouter = require('./routes/admin/chapters');
const adminChartsRouter = require('./routes/admin/charts');
const adminAuthRouter = require('./routes/admin/auth');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

//CORS跨域配置
app.use(cors());
/*当正式上线，有前端地址的时候，可以这么写。(多个来源就用数组)
const corsOptions = {
  origin: [
    'https://clwy.cn',
    'http://localhost:63342'
  ]
}
app.use(cors(corsOptions));
*/

//前台路由配置

//后台路由配置(长乐未央)，中间件的顺序代表了执行顺序
app.use('/admin/articles',adminAuth,adminArticlesRouter);
app.use('/admin/categories',adminAuth, adminCategoriesRouter);
app.use('/admin/settings',adminAuth, adminSettingsRouter);
app.use('/admin/users',adminAuth, adminUsersRouter);
app.use('/admin/courses',adminAuth, adminCoursesRouter);
app.use('/admin/chapters',adminAuth, adminChapterRouter);
app.use('/admin/charts',adminAuth, adminChartsRouter);
app.use('/admin/auth', adminAuthRouter); //登录接口不要加登录验证中间件，不能还没登录就验证是否登录

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
