var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//includes for mongoDB connectivity
var mongoose = require('mongoose');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();


//DB setup
//Schema defines what goes in a collection
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;
//connect to the database
mongoose.connect('mongodb://localhost:27017');
//schema for global tracking of games played 
var globalSchema = new Schema({
  gamesPlayed : Number,
  redWins : Number,
  blueWins : Number,
  tags : Number,
  totalCaptures : Number
});
//model sets up the schema for usage although in this case there will only be one entry ever
var globalModel = mongoose.model('globalModel',globalSchema);
//  //initialize a model 
var globDB = new globalModel();
//clear the db for testing purposes
// globalModel.remove({}, function(err) { 
//    console.log('cleared globalModel');
// });
//set the model's data
globDB.gamesPlayed = 100;
globDB.redWins = 50;
globDB.blueWins = 50;
globDB.tags = 14276;
globDB.totalCaptures = 2000;
//save the instance
globDB.save();
globalModel.find({},function(err,docs){
  for(doc in docs){
    console.log(docs[doc]);
  }
});

//schema for tracking of users
var userInfoSchema = new Schema({
  name : String,
  gamesPlayed : Number,
  wins : Number,
  losses : Number,
  tags : Number,
  captures : Number
})
//model sets up schema for usage
var uInfo = mongoose.model('uInfoModel',userInfoSchema);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
