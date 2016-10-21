/**
 * Prerequisite Packages
 */
var express = require('express');
var https = require('https');
var BodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');

var tokenChecker = require('./routes/tokenChecker');
var errorHandler = require('./routes/errorHandler');

var authorize = require('./routes/authorize');
var users = require('./routes/users');
var movies = require('./routes/movies');
var ratings = require('./routes/ratings');

/**
 * Configure Database
 */
mongoose.connect('mongodb://10.0.0.11', {server: {connectTimeoutMS: 2000}});
mongoose.Promise = global.Promise; //Prevent deprecated errors

//Check whether an connection error occurred
mongoose.connection.on('error', function (error) {
    console.error(error);
});

//Check whether connection succeeded
mongoose.connection.on('connected', function () {
    console.log('Successfully connected to the mongodb');
});

var app = express();
app.set('privateKey', 'Aruba'); //Set the private key, that would be used for jwt

app.use(BodyParser.urlencoded({extended: true})); //Support encoded bodies

app.use(BodyParser.json()); //Support JSON encoded bodies


//Verifies token on all the api
app.use('/api', tokenChecker);
app.use('/api/authorize', authorize);
app.use('/api/users', users);
app.use('/api/movies', movies);
app.use('/api/ratings', ratings);

app.use(express.static('public')); //Load the static page

//Loads the index by default on the root
app.get('/', function (request, response) {
    response.sendFile('/public/index.html');
});

app.use(errorHandler); //To handle errors

app.listen(config.port, null); //Start listening