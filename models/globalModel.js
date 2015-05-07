var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

// schema for global tracking of games played 
var GlobalModel = new Schema({
  gamesPlayed   : Number,
  redWins       : Number,
  blueWins      : Number,
  tags          : Number,
  totalCaptures : Number
});

module.exports = GlobalModel = mongoose.model('GlobalModel', GlobalModel);