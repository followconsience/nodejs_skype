var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs'); // bcryptjs
var session = require('express-session'); // express-session
var flash = require('connect-flash'); // connect-flash
var passport = require('passport'); // passport
var LocalStrategy = require('passport-local').Strategy; // passport-local
var mongoose = require('mongoose'); // mongoose
var async = require('async');

// mongoose.connect('mongodb://localhost:27017/skype',{useNewUrlParser: true});
mongoose.connect('mongodb://wegive4:Hiepnh1985@ds135413.mlab.com:35413/hycore', { useNewUrlParser: true }); // connect to server
mongoose.set('useCreateIndex', true); // Để không hiện cảnh báo: (node:19948) DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
mongoose.set('useFindAndModify', false); // Để không hiện cảnh báo: DeprecationWarning: collection.findAndModify is deprecated. Use findOneAndUpdate, findOneAndReplace or findOneAndDelete instead.

// var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
app.io = require('socket.io')(); // Socket.IO
var routes = require('./routes/index')(app.io); // Socket.IO

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

/**********Additional config**********/
// session
app.use(session({
  secret: 'Hiepnh',
  resave: false,
  cookie: {
    maxAge: 1000*60*60*4 // 4 giờ - Thời gian sống của session (tạo ra cookie hoạt động)
  },
  saveUninitialized: true, // Không cho phép tạo mới id sau mỗi lần chạy
}));
// flash
app.use(flash());
app.use(function (req , res , next) {
	res.locals.success_msg = req.flash('success_msg'); // Biến local trả về thành công
	res.locals.error_msg = req.flash('error_msg'); // Biến local trả về lỗi chứng thực
	res.locals.error = req.flash('error'); // Biến local trả về lỗi thông tin (error đưa sang views)
	next();
})
// passport
app.use(passport.initialize());
app.use(passport.session()); // passport use session to store information

app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', index);
app.use('/', routes); // Socket.IO
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
