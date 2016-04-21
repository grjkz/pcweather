var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var path = require('path');
var session = require('express-session');
require('dotenv').config();

// get mongoose connection and models
var db = require('./config/db/mongoose');
var User = db.model('User');
var Favorite = db.model('Favorite');
var History = db.model('History');

// exit if no keys are found
if (!process.env.FORECAST_KEY || !process.env.GEOCODING_KEY) {
	console.log("Could not get forecast or geo key! Exiting...")
	process.exit(1);
}

// preset the request URLs
app.set("geoUrl", "https://maps.googleapis.com/maps/api/geocode/json?key="+ process.env.GEOCODING_KEY +"&address=");
app.set('forecastUrl', "https://api.forecast.io/forecast/"+ process.env.FORECAST_KEY +"/");

// set port
app.set('port', process.env.PORT || 3000);

// use session
app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: process.env.SESSION_SECRET || 'nyanpoop',
	cookie: {maxAge: 86400000} // 24 hours
}))

// set body-parser
app.use(bodyParser.urlencoded({extended:false}));

// set views and public folder
app.set('view engine', 'ejs');
app.set('views', 'public/views')
app.use(express.static('public'));


////////////
// ROUTES //
////////////

//////////
// ROOT //
//////////

app.get('/', function(req, res) {
	console.log(req.session)
	res.render('index', {session: req.session.email});
});

////////////////
// USER LOGIN //
////////////////
app.get('/login', function(req,res) {
	res.render('login', {session: req.session.email, error: false});
});

app.post('/login', function(req,res) {
	User.findOne({email: req.body.email}, function(err, user) {
		if (err || !user || user.password !== req.body.password) {
			res.render('login', {session: req.session.email, error: "Incorrect Credentials"});
		} else {
			// set session
			req.session.email = user.email;
			res.redirect('/');
		}
	})
});

///////////////////////
// USER REGISTRATION //
///////////////////////
app.get('/signup', function(req,res) {
	res.render('sign_up', {session: req.session.email})
});


app.post('/signup', function(req,res) {
	var email = req.body.email;
	var pass = req.body.password;
	
	User.create({email: email, password: pass}, function(err, user) {
		if (err) {
			console.log(err)
			res.redirect('/signup');
		} else {
			req.session.email = user.email;
			res.redirect('/');
		}
	})
});


//////////////////
// USER SIGNOUT //
//////////////////
app.get('/logout', function(req,res) {
	req.session.destroy(function(err) {if (err) console.log(err)});
	res.redirect('/');
});


/////////////
// WEATHER //
/////////////

app.get('/weather', function(req, res) {
	// if user is logged in
	if (req.session.email) {
		// create new history document
		History.create({query: req.query.location}, function(err, historyItem) {
			if (err) {
				console.log(err)
			}
			else {
				// query user
				User.findOne({email: req.session.email}, function(err, user) {
					if (err) console.log(err);
					else {
						// push new history query into user's history
						user.history.push(historyItem)
						// remove oldes history item if over 5 saved items
						user.history.length > 5 ? user.history.shift() : 1;
						// don't forget to save
						user.save();
					}
				});

			}
		});
		
	}

	// GET COORDINATES
	grabCoords(req, res, function(coords) {
		// GET WEATHER
		var foreUrl = app.get("forecastUrl") + coords.lat + "," + coords.lng;

		request(foreUrl, function(err, response, forecastBody) {			
			if (err || response.statusCode == 400) {
				return res.send(forecastBody);
			}
			var forecastResults = JSON.parse(forecastBody);

			res.render('weather', {results: forecastResults, coords: (coords), session: req.session.email});
		});
	});
});

// API (AJAX) call to get the weather data of the last three days and return json
app.get('/weather/history', function(req,res) {
	var lat = req.query.lat;
	var lng = req.query.lng;
	var secPerDay = 86400;
	var date = new Date();
	var unixTimeSec = Math.floor(date.getTime()/1000);
	var targetDate = new Date(unixTimeSec - (secPerDay * 3));
	var foreUrl = app.get("forecastUrl") + lat + "," + lng + "," + targetDate.getTime();
	var results = [];

	// get 3rd day before today
	request(foreUrl, function(err, response, forecastBody) {
		if (err || response.statusCode == 400) {
			
			return res.redirect('/');
		}
		results.push(JSON.parse(forecastBody));
		var targetDate = new Date(unixTimeSec - (secPerDay * 2));

		// get 2nd day before today
		request(foreUrl, function(err, response, forecastBody) {
			if (err || response.statusCode == 400) {
			
				return res.redirect('/');
			}
			results.push(JSON.parse(forecastBody));
			var targetDate = new Date(unixTimeSec - (secPerDay * 1));

			// get previous day
			request(foreUrl, function(err, response, forecastBody) {
				if (err || response.statusCode == 400) {
			
					return res.redirect('/');
				}
				results.push(JSON.parse(forecastBody));
				// res.send(results[0])
				res.send(results);
			});
		});
	});

});


//////////////////
// USER RELATED //
//////////////////

// get user's saved queries
app.get('/user/favorites', function(req,res) {
	User.findOne({email: req.session.email}).populate('history').exec(function(err, history) {
		res.send(history.favorites);
	})
});

// get user's search history
app.get('/user/searchhistory', function(req, res) {
	User.findOne({email: req.session.email}).populate('history').exec(function(err, history) {
		res.send(history.history);
	})
})





////////////
// LISTEN //
////////////

app.listen(app.get('port'),function(){
	console.log("listening on " + app.get('port'));
});




///////////////
// FUNCTIONS //
///////////////

/**
 * Get the coordinates from Google GeoCoding API
 * @param  {object}   res      response to client
 * @param  {string}   location parameter from client's request
 * @param  {function} callback callback function; pass in object: coordinates (.lat .lng)
 */
function grabCoords(req, res, callback) {
	var location = req.query.location;
	if (!location) res.redirect('/'); // redirect if no location given
	var geoQuery = app.get('geoUrl') + location;

	request(geoQuery, function(err, response, geoBody) {
		// parse the results
		var geoResults = JSON.parse(geoBody);
		
		// redirect if error exists, bad request, or no results
		if (err || response.statusCode == 400 || geoResults.status !== "OK") {
			console.log(err);
			return res.redirect('/');
		}

		var coords = geoResults.results[0].geometry.location; // .lat .lng
		// USE CALLBACK and send back geo coordinates
		return callback(coords);
	});
}


// function getWeatherHistory(res, coords, days) {

// 	var secPerDay = 86400;
// 	var date = new Date();
// 	var unixTimeSec = Math.floor(date.getTime()/1000);
// 	var targetDate = new Date(unixTimeSec - (secPerDay * days));

// 	var foreUrl = app.get("forecastUrl") + coords.lat + "," + coords.lng + "," + targetDate.getTime();
	
// 	request(foreUrl, function(err, response, forecastBody) {			
// 		if (err || response.statusCode == 400) {
// 			console.log("error in getWeatherHistory while requesting weather data")
// 			return;
// 		}
	
// 		return (forecastBody);

// 	});
// }