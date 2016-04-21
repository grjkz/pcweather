# Philip Choi Code Challenge 2 - BW

## SkyCast would like their users to be able to enter in any location and retrieve current and useful information about the weather in that area, as well as a future forecast.

### Include charts for historic weather information about that area using any visualization library of your choice, allowing the user to see relevant information within a reasonable time period.
* Determine which data visualization tool to use

### Additionally, the team feels that allowing a user to track his or her search history would be a valuable addition, and would like to see a way of storing queries made by a specific user between browser sessions.
* Utilize MongoDB to save search queries
* Users can create accounts; Use passport;
* Create a user/history page to show a user's query history

### Database
* users
* histories

### Routes
* root
 * Provides a search field to look up weather at desired location

* /weather
 * Shows the weather at specified location

* /user/history
 * Displays entire history of user's queries
 * Order by Date DESC

#### Extra
* /user/favorites
 * API - Use an AJAX call to get the user's favorite locations
 * List of user's favorite locations for quick access. Limit it to 5

### Technologies
* Node/Express
* Forecast.io[https://developer.forecast.io]
* Google Geolocation[https://developers.google.com/maps]
* Passport