var mongoose = require('mongoose');

var historySchema = new mongoose.Schema({
	query: {type: String, required: true},
	addedOn: {type: Date, default: Date.now}
});

mongoose.model('History', historySchema);
module.exports = mongoose.model('History');