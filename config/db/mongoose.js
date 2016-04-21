var mongoose = require('mongoose');
var uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pcweather';

// load and create models
require('./models/favorites');
require('./models/history');
require('./models/user');

// create connection to mongod
mongoose.connect(uri, function(error) {
	if (error) {
		console.log(error);
		console.log("Couldn't connect to MongoDB. Is it running?");
	}
});

module.exports = mongoose;