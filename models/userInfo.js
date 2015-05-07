var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

// schema for tracking of users
var UserInfoSchema = new Schema({
  name        : String,
  gamesPlayed : Number,
  wins        : Number,
  losses      : Number,
  tags        : Number,
  captures    : Number
});

module.exports = UserInfo = mongoose.model('UserInfo', UserInfoSchema);