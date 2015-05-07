var express = require('express');
var router = express.Router();

// MongoDB dependencies
var mongoose = require('mongoose');
var GlobalModel = mongoose.model('GlobalModel');
var UserInfo = mongoose.model('UserInfo');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CTF' });
});

router.get('/leaderboard', function(req, res, next){
	res.render('leaderboard', { title:'CTF Leaderboard' });
});

router.get('/userInfo', function(req, res, next) {
  // clear the db for testing purposes
  // response.stats = [{
  //   gamesPlayed   : 100,
  //   redWins       : 50,
  //   blueWins      : 50,
  //   tags          : 14276,
  //   totalCaptures : 2000
  // }];

  // newGlobal = new GlobalModel(response.stats);
  // newGlobal.save({});

  // response.users = [
  //   { name: 'Plotka', gamesPlayed: 10, wins: 10, losses: 0, tags: 100, captures: 50 },
  //   { name: 'Shirly', gamesPlayed: 5, wins: 4, losses: 1, tags: 25, captures: 3 },
  //   { name: 'Ahmed', gamesPlayed: 20, wins: 10, losses: 10, tags: 250, captures: 25 }
  // ]

  // UserInfo.create(response.users, function(err, _) {
    // res.json(response);
  // });

  UserInfo.find({}, function(err, users) {
    GlobalModel.find({}, function(err, stats) {
      res.json({ users: users, stats: stats });
    });
  });
});

router.post('game_results', function(req, res, next) {
  // Expects { gamesPlayed, redWins, blueWins, tags, totalCaptures }
  var stats = req.body.stats;
  console.log("yo" + req.body.stats);

  GlobalModel.update({}, stats, function() {
    res.json({ result: true });
  });
});

module.exports = router;
