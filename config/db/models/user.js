var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	email: {type: String, required: true, index: {unique: true}},
	password: {type: String, required: true},
	favorites: [{ type: Schema.Types.ObjectId, ref: 'Favorite' }],
	history: [{ type: Schema.Types.ObjectId, ref: 'History' }]
});

mongoose.model('User', userSchema);
module.exports = mongoose.model('User');