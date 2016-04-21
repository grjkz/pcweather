var mongoose = require('mongoose');

var favoriteSchema = new mongoose.Schema({
	query: {type: String, required: true},
	addedOn: {type: Date, default: Date.now}
});

mongoose.model('Favorite', favoriteSchema);
module.exports = mongoose.model('Favorite');