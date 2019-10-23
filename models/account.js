var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var accSchema = new Schema({
  username: {type: String, unique: true, require: true, trim: true}, //
  email: {type: String, unique: true, require: true, trim: true},
  password: {type: String, require: true, trim: true},
  fullname: {type: String, require: true, trim: true},
  avatar: {type: String, require: true, trim: true, 'default':'user.png'},
  role: {type: Number, 'default': 1},
  created_at: { type: Date, default: Date.now }
}); // Khai báo tên collection được khởi tạo.

// Nếu không khai báo thì mongoose sẽ tạo collection với tên là accs (số nhiều)
var Acc = module.exports = mongoose.model('Account', accSchema);

// module.exports.checkAcc = function(callback){
//   Acc.find(callback);
// }

// module.exports.getUserById = function(id, callback){
//   Acc.findById(id, callback);
// }
