const connectionUrl = process.env.MONGO_URL
console.log(connectionUrl);

var mongoose = require('mongoose');
mongoose.connect(connectionUrl, {});