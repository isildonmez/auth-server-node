var config = require('./config');
var mongoose = require('mongoose');

mongoose.connect(config.url, {});