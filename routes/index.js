var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CTF' });
});

router.get('/leaderboard',function(req,res,next){
	res.render('../leaderboard',{title:'CTF'});
});

module.exports = router;
