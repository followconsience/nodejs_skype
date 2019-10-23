var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var Person = require('../models/account.js');

var groupSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'Account' }, // Tức là tham chiếu tới ObjectId của Account (chính là _id)
  title: String,
  member: [
    {
      user:  {type: Schema.Types.ObjectId, ref: 'Account'},
      createdOn: { type: Date, 'default': Date.now }
    }
  ],
  comment : [
      {
          user : {type: Schema.Types.ObjectId, ref: 'Account'},
          content : String,
          file: String,
          createdOn: { type: Date, 'default': Date.now }
      }
  ]
});

module.exports = mongoose.model('Group', groupSchema);
