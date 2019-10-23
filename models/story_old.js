var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var Person = require('../models/person.js');

var storySchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'Person' },
  // author: { type: Schema.ObjectId, ref: 'Person' },
  title: String
});

module.exports = mongoose.model('Story', storySchema);
