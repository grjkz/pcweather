var db = require('./mongoose');

var User = db.model('User');
var Favorite = db.model('Favorite');
// User.create({email: "asdf", password: "qwerty"},function(err) {
// 	console.log(err)
// })

// Favorite.create({_user: '5717fdc954e624e536caa9ff', query: '11219'}, function(err) {
// 	console.log(err)
// });

// User.findOne({email: 'asdf'}).populate('favorites').exec(function(err, user) {
// 	console.log(err);
// 	console.log(user)
// });

// Favorite.create({query: 'california'}, function(err, favorite) {
// 	console.log(err)
// 	User.findOne({email:'asdf'}, function(err, user) {
// 		console.log(err)
// 		user.favorites.push(favorite)
// 		user.save(function(err, res) {
// 			console.log('saving reference')
// 			console.log(err)
// 			console.log(res)
// 		})
// 	});
// });

User.findOne({email:'asdf'}).populate('favorites').exec(function(err,user) {
	console.log(err)
	console.log(user)
})