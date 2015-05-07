var mongoose = require('mongoose');
var GlobalModel = require('./models/globalModel.js');
var UserInfo = require('./models/userInfo.js');

// Connect to MongoDB
mongoose.connect('mongodb://localhost/ctf');