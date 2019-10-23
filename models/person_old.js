var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var personSchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  age: Number
});

module.exports = mongoose.model('Person', personSchema);
