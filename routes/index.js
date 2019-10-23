var express = require('express');
var bcrypt = require('bcryptjs'); // bcrypt
var passport = require('passport'); // passport
var LocalStrategy = require('passport-local').Strategy; // passport-local
var multer  = require('multer'); // Multer
var mongoose = require('mongoose');
var async = require('async');
var router = express.Router();

/***********TRIỆU GỌI MODEL VÀ FUNCTION***********/
var Account = require('../models/account.js');
var Group = require('../models/group.js');
// var Person = require('../models/person.js');
// var Story = require('../models/story.js');
var bsf = require('../helpers/basic_function.js');

/***********TESTING FIND DATA***********/
router.get('/mod', function(req, res, next) {
  // Group.find({member.user:'5bdc424c1937f81e78ffae90'}).then(function(myDoc){
  //   res.send(myDoc);
  // });
  // Group.find({"member.user":"5bdc424c1937f81e78ffae90"}, function (err, docs) {
  //   res.send(docs);
  // });

  Group.findOne({'member.user':'5bdc424c1937f81e78ffae90'}).
  populate({
    path: 'comment.user',
  }).
  exec((err,data)=>{
    res.send(data);
  });

});

/***********ĐĂNG KÝ TÀI KHOẢN***********/
router.get('/register', function(req, res, next) {
  res.render('register',{notice:""});
});

router.post('/register', function(req, res, next) {
  var arr = [req.body.username,req.body.email,req.body.password,req.body.fullname];
  var notice = "";
  if (bsf.checkEmpty(arr)) {
    notice = "Dữ liệu không được để trống";
    res.render('register',{notice:notice});
  }else{
    // Kiểm tra xem có tài khoản nào bị trùng không
    Account.find({ $or: [{username: req.body.username}, {email: req.body.email}]}, function (err, data) {
      if (data.length) { // Cân nhắc tách riêng username với email
        notice = "Tài khoản/Email đã tồn tại";
        res.render('register',{notice:notice});
      }else{
        // Mã hóa password và lưu thông tin vào DB
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                // Store hash in your password DB.
                var data = {
                  username: req.body.username,
                  email: req.body.email,
                  password: hash,
                  fullname: req.body.fullname
                };
                var obj = new Account(data);
                obj.save();
                res.send('Đăng ký thành công');
            });
        });
      }
    });
  }
});

/***********ĐĂNG NHẬP VÀ CHỨNG THỰC***********/
router.get('/login', function(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/'); // Truy cập trang chủ khi đã đăng nhập rồi
  }else{
    res.render('login',{errors: null}); // Nếu dùng error lại bị sai???
  }
});

/**B1: Khai báo phương pháp chứng thực local sau khi submit form
* `req.user` contains the authenticated user
* req.user là object chứa các thông tin của người dùng đã được chứng thực
* Phương thức này mặc định sẵn do passportjs thiết lập
*/
router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
);

/**
* B2: Tiến hành chứng thực
* Kiểm tra username/email
* Kiểm tra password
*/
passport.use(new LocalStrategy({
    usernameField: 'email', // email/username
    passwordField: 'password' // password
  },
  function(username, password, done) {
    // Cho phép người dùng đăng nhập bằng cả email hoặc username
    Account.find({$or: [{username:username},{email:username}]}, function(err, data){
      // if (err) throw err;
      if (data.length) {
        // console.log(data);
        // Load hash from your password DB to compare
        bcrypt.compare(password, data[0].password, function(err, res) { // data[0]: phần tử đầu tiên của kết quả tìm kiếm trả về
          if (err) throw err;
          if (res) { // Nếu kết quả đúng (res === true)
            return done(null, data[0]); // Trả về thông tin người dùng (là một mẩu tin)
          }else{ // Nếu kết quả sai (res === false)
            return done(null, false, {message:"Mật khẩu không chính xác"}); // Chứng thực lỗi, kèm theo thông báo lỗi
          }
        });
      }else{
        return done(null, false, {message:"Tài khoản/email không đúng"}); // Chứng thực lỗi, kèm theo thông báo lỗi
      }
    });

  }
));

/**
* B3: Nếu chứng thực thành công
*/
passport.serializeUser(function(userOK, done){ // userOK: là kết quả userRecord - data[0] ở B2 (Bước 2) trả về
  // console.log(userOK);
  done(null, userOK); // Object của user
});

/**
* B4: Lấy thông tin cookie đã lưu trong trình duyệt do session của passport B3 tạo ra
* Kiểm tra một lần nữa xem có trùng với thông tin trong database hay không (Xác thực lại - de+serializeUser)
* Tránh tình trạng client tự tạo cookie/session không thông qua đăng nhập hoặc đăng nhập xong lại đổi password
*/
passport.deserializeUser(function(userOK, done){
  // Tại bước này chỉ cần so sánh với username/email thôi mà không cần hoặc cả hai
  // Với password thì so sánh trực tiếp với DB mà không dùng bcrypt nữa (userOK.password chính là password lưu trong DB xuất ra tại B3)
  Account.find({username:userOK.username, password:userOK.password}, function(err, data){
    // if (err) throw err;
    if (data.length) {
      // console.log(userOK);
      return done(null, userOK);
    }else{
      return done(null, false, {message:"Thông tin đăng nhập không chính xác"}); // Chứng thực lỗi, kèm theo thông báo lỗi
    }
  });
});

/**
* B5.1: Cấp giấy thông hành user
*/
function checkAuth(req, res, next){
  if (req.isAuthenticated()) { // Trả về true nếu đã đăng nhập rồi
    next(); // Thực thi hành động tiếp theo: cho phép truy cập
  }else{
    res.redirect('/login');
  }
}

/**
* B5.2: Cấp giấy thông hành DB Admin
*/
function checkDBAdmin(req, res, next){
  if (req.isAuthenticated()) { // Trả về true nếu đã đăng nhập rồi
    if (req.user.role == 1985) { // 1985-DBAdmin Role
      next(); // Thực thi hành động tiếp theo: cho phép truy cập
    }else{
      res.redirect('/'); // Trở về trang chủ
    }
  }else{
    res.redirect('/login');
  }
}

/***********TRUY CẬP NỘI DUNG***********/
/*Trang chủ: Thông tin user/Danh sách group/Danh sách bạn bè/Màn hình chờ đợi chọn nhóm/bạn bè để chát*/
router.get('/', checkAuth, function(req, res, next) {
  // res.render('home', { user: req.user});

  // Group.find().then(function (dbgroup) {
  //   var data = {db: dbgroup, user: req.user};
	// 	res.render('home',{data : data});
	// });
  async.parallel([
		(callback) => {
      Group.find({}).exec((err,data1)=>{
        callback(null, data1);
      });
		},
    (callback) => {
      Account.find({}).exec((err,data2)=>{
        callback(null, data2);
      });
		}
	],
		(err, results) => {
      var data = {dbgroup: results[0],dbaccount: results[1], user: req.user};
      res.render('home',{data : data});
		});

});



/*Cập nhật tài khoản*/
router.get('/update', checkAuth, function(req, res, next) {
  res.render('update', {user: req.user, notice: ""});
});

router.post('/update', checkAuth, function(req, res, next) {
  Account.findById(req.user._id, function(err, data){
    if (err) throw err;
    if (req.body.fullname != "") {
      if (req.body.password != "") {
        // Mã hóa password và lưu thông tin vào DB
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                // Store hash in your password DB.
                Account.findById(req.user._id, function(err, data){
                  data.fullname = req.body.fullname;
                  data.password = hash;
                  req.user.fullname = req.body.fullname; // Gán lại giá trị cho fullname
                  data.save(); // Cập nhật mẩu tin
                  res.redirect('/'); // Trở về trang chủ
                });
            });
        });
      }else{
        data.fullname = req.body.fullname;
        req.user.fullname = req.body.fullname; // Gán lại giá trị cho fullname
        data.save(); // Cập nhật mẩu tin
        res.redirect('/'); // Trở về trang chủ
      }
    }else{
      var notice = "Họ và tên không được để trống";
      res.render('update', {user: req.user, notice: notice});
    }
  });
});

/*Cập nhật ảnh đại diện*/
// https://stackoverflow.com/questions/45131569/simple-multipart-file-upload-with-express-js-and-multer-with-ajax
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/avatar');
  },
  filename: function (req, file, cb) {
    var newname = req.user.username+'.'+file.originalname.split(".")[1];
    // console.log(newname);
    cb(null,newname);
  }
});

// Kiểm soát mimeType
function handleMimeType(req, file, cb){
  if (!file.originalname.toLowerCase().match(/\.(jpg|png|jpeg|gif)$/)) {
    return cb(new Error('Chỉ chấp nhận file hình'));
  }else{
    cb(null, true);
  }
}

var upload = multer({ storage: storage, fileFilter: handleMimeType});

router.get('/updateimg', checkAuth, function(req, res, next) {
  res.render('updateimg', {user: req.user, notice: ""});
});

// avatar là name của type="file"
router.post('/updateimg', upload.single('avatar'), function(req, res, next){
  // console.log(req.file);
  if (req.file) {
    Account.findById(req.user._id, function(err, data){
      if (err) throw err;
      var newname = req.user.username+'.'+req.file.originalname.split(".")[1];
      data.avatar = newname;
      req.user.avatar = newname; // Gán lại giá trị cho avatar
      data.save(); // Cập nhật mẩu tin
      res.redirect('/'); // Trở về trang chủ
    });
  }
});

/*DBAdmin*/
router.get('/dbadmin', checkDBAdmin, function(req, res, next) {
  Account.find().then(function(data){
    res.render('dbadmin',{data:data, user:req.user});
  });
});

/*DBAdmin Maintain*/
router.get('/dbmaintain', checkDBAdmin, function(req, res, next) {
  res.render('dbmaintain',{user:req.user});
});



/***********AJAX***********/
// https://gist.github.com/diorahman/1520485
// Ajax, call jQuery POST to node.js expressjs

router.post('/testsocket', function(req, res){
  res.send('Testing for socket.io. User '+req.user.username+' just click');
});

router.post('/addgroup', checkAuth, function(req, res){
  var group = new Group({
    author: req.user._id,   // assign the _id from the person
    title: req.body.name,
    member: [{user : req.user._id}], // Add thành viên đầu tiên là người tạo
    comment: []
  });
  group.save(function (err) {
    if (err) return handleError(err);
    res.send('Khởi tạo thành công');
  });
});

/*AJ3*/
router.post('/listaccount', checkAuth, function(req, res){
  // console.log(req.body.groupid);
  async.parallel([
		(callback) => {
      Group.findOne({_id:req.body.groupid}).
      populate({
        path: 'member.user',
      }).
      exec((err,data1)=>{
        callback(null, data1);
      });
		},
    (callback) => {
      Account.find({}).exec((err,data2)=>{
        callback(null, data2);
      });
		}
	],
		(err, results) => {
      res.json({
        mems: results[0],
        accs: results[1]
      });
		});

  // Account.find().then(function(data){
  //   // console.log(data);
  //   res.json({
  //     accs: data,
  //   });
  // });
});

/*AJ4*/
router.post('/addpeople', checkAuth, function(req, res){
  // console.log(req.body.gid);
  // console.log(req.body.people);
  if (req.body.people.length) {
    req.body.people.forEach(function(itemt){
      Group.findOneAndUpdate({_id:req.body.gid},{ $push:{ member:{user : itemt}}},{ new : true },function(err,doc){
          if (err) throw err;
        }
      );
    });
  }
  res.end();
});

/*AJ5*/
router.post('/addmessage', checkAuth, function(req, res){
  // Thêm dữ liệu vào DB
  // console.log(req.body.mss);
  // console.log(req.body.ro);
    Group.findOneAndUpdate({_id:req.body.ro},{ $push:{ comment:{user : req.user._id, content : req.body.mss, file: ''}}},{ new : true },function(err,doc){
        if (err) throw err;
      }
    );

  // Trả về thông tin client
  res.json({
    user: req.user,
  });
  res.end();
});

/*AJ6*/
router.post('/listmss', checkAuth, function(req, res){
  Group.findOne({_id:req.body.groupid}).
  populate({
    path: 'comment.user',
  }).
  exec((err,data)=>{
    // console.log(data);
    res.json({
      mss: data,
    });
  });
});

/*AJ7*/
router.post('/typing', checkAuth, function(req, res){
  res.send(req.user.username);
});

/*AJ8*/
var storageM = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads');
  },
  filename: function (req, file, cb) {
    // var newname = file.originalname;
    var newname = Date.now()+'.'+file.originalname.split(".")[1];
    cb(null,newname);
  }
});

var uploadM = multer({ storage: storageM, fileFilter: handleMimeType});

router.post('/addfile',checkAuth, uploadM.array('files[]', 100), function(req, res, next) {
  console.log(req.files);
  console.log(req.body.groupid);

  req.files.forEach(function(item){
    Group.findOneAndUpdate({_id:req.body.groupid},{ $push:{ comment:{user : req.user._id, content : "", file:item.filename}}},{ new : true },function(err,doc){
        if (err) throw err;
      }
    );
  });

  var data = {user: req.user, files: req.files};
  // Trả về thông tin client
  res.send(data);
  res.end();
});


  // Group.findOneAndUpdate({_id:req.body.ro},{ $push:{ comment:{user : req.user._id, content : req.body.mss}}},{ new : true },function(err,doc){
  //     if (err) throw err;
  //   }
  // );
  //
  // // Trả về thông tin client
  // res.json({
  //   user: req.user,
  // });
  // res.end();

// router.get('/test1', function(req, res, next){
// 	var author = new Person({
// 	  _id: new mongoose.Types.ObjectId(),
// 	  name: 'Nguyễn Hữu Hiệp',
// 	  age: 50
// 	});
//
// 	author.save(function (err) {
// 	  if (err) return handleError(err);
//
// 	  var story1 = new Story({
// 	    title: 'Passion',
// 	    author: author._id   // assign the _id from the person
// 	  });
//
// 	  story1.save(function (err) {
// 	    if (err) return handleError(err);
// 	    res.send('Done');
// 	  });
// 	});
// });
//
// router.get('/test2', function(req, res, next){
// 	Story.
// 	  findOne({ title: 'Passion' }).
// 	  populate('author').
// 	  exec(function (err, story) {
// 	    if (err) return handleError(err);
// 	    res.send('The author is %s' + story.author.name);
// 	  });
// });

// router.get('/test3', function(req, res, next){
//   var group1 = new Group({
//     author: req.user._id,   // assign the _id from the person
//     title: 'Mission',
//     comment: []
//   });
//
//   group1.save(function (err) {
//     if (err) return handleError(err);
//     res.send('Done');
//   });
// });
//
// router.get('/test4', function(req, res, next){
// 	Group.
// 	  findOne({ title: 'Mission' }).
// 	  populate('author').
// 	  exec(function (err, data) {
// 	    if (err) return handleError(err);
// 	    res.send('Người khởi tạo nhóm là: ' + data.author.fullname);
// 	  });
// });
//
// router.get('/test5', function(req, res, next){
// 	Group.
// 	  find({}).
// 	  populate('author').
// 	  exec(function (err, data) {
// 	    if (err) return handleError(err);
// 	    console.log(data);
// 	  });
// });

// router.get('/test6', function(req, res, next){
//   Group.findOneAndUpdate({_id:'5bd6c911c1e9ca24e4fd576d'},{ $push:{ comment:{user_name : req.user.username, content : 'Tin nhắn thử nghiệm'}}},{ new : true },function(err,doc){
//       if (err) throw err;
//       res.send('ok');
//     }
//   );
// });
//
// router.get('/test7', function(req, res, next){
//   Group.findById('5bd6c911c1e9ca24e4fd576d', function (err, doc) {
//     res.send(doc.comment);
//   });
// });
//
// router.get('/test8', function(req, res, next){
//   Group.findOneAndUpdate({_id:'5bdb0b34a146063884730ec0'},{ $push:{ member:{user : req.user._id}}},{ new : true },function(err,doc){
//       if (err) throw err;
//       res.send('ok');
//     }
//   );
// });
//
// router.get('/test9', function(req, res, next){
//   // Group.findById('5bdb0b34a146063884730ec0', function (err, doc) {
//   //   res.send(doc.member);
//   // });
//   	Group.
//   	  find({}).
//   	  // populate('author').
//       populate({
//   			path: 'member.user',
//   			select: 'email'
//   		}).
//   	  exec(function (err, data) {
//   	    if (err) return handleError(err);
//         res.send(data);
//   	    // console.log(data);
//   	  });
// });


// router.get('/add', function(req, res, next) {
//   // var data = {
//   //   owner: req.user._id,
//   //   group_name: 'Nhóm do user: '+req.user.username+' tạo',
//   //   comment: []
//   // };
//   // var obj = new Group(data);
//   // obj.save();
//
// });


/***********ĐĂNG XUẤT***********/
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

// module.exports = router;

module.exports = function (io) {
    //Socket.IO
    io.on('connection', function (socket) {
        console.log('Co nguoi vua ket noi den index.js: '+socket.id);

        // Test join nhiều room
        let ROOM_DEMO = ['room_akshsxcnzms2178338','room_new12345'];
        socket.join(ROOM_DEMO, () => {
            let rooms = Object.keys(socket.rooms);
            console.log(rooms); // [ <socket.id>, 'room 237' ]
        });

        // Testing emit về 1 room cụ thể
        let detailroom = 'room_akshsxcnzms2178338';
        // io.sockets.in(detailroom).emit('send_data_room_demo_ssc', "You are in room no. "+detailroom); // emit all
        socket.broadcast.to(detailroom).emit('send_data_room_demo_ssc', "You are in room no. "+detailroom); // emit all ngoại trừ sender

        /*ON EVENTS*/
        /*TESTING*/
        socket.on("Client-send-data", function(data){
          console.log(data); // done
          io.sockets.emit("Server-send-data", data);
        });

        /*EVENT 2*/
        // Step 2
        socket.on("Client-send-data-2", function(data){
          // Rời khỏi room cũ
          socket.leave(data.oldRoom, function(err){
            if (err) {
              console.log(err);
            }
          });

          // Server tạo ra một room có tên là data.newRoom (nếu chưa có) và cho socket.id join vào
      		socket.join(data.newRoom);
          // console.log(socket.adapter.rooms);
        });

        /*EVENT 03*/
        // Step 2
        socket.on("Client-send-data-3", function(data){
          console.log(data);
          // Server tạo ra một room mới (nếu chưa có) và cho socket.id join vào
      		socket.join(data.room);

          // Step 3
          io.sockets.in(data.room).emit("Server-send-data-3", data);
        });

        /*EVENT 04*/
        // Step 2
        socket.on("Client-send-data-4", function(data){
          // Step 3
          io.sockets.in(data.room).emit("Server-send-data-4", data);
        });

        /*EVENT 05*/
        // Step 2
        socket.on("Client-send-data-5", function(data){
          console.log(data.room);
          console.log(data.user);
          console.log(data.img);
          // Step 3
          io.sockets.in(data.room).emit("Server-send-data-5", data);
        });

    });
    return router;
};
