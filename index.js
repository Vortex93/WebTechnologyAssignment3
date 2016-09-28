/**
 * Modules
 */
var express = require('express');
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

/**
 * Classes
 */
var Config = require('./global');
var Movie = require('./model/movie');
var User = require('./model/user');
var Rating = require('./model/rating');

/**
 * Properties
 */
var movies = [];
var users = [];

var app = express();
movies.push(new Movie('tt2404435',
    'The Magnificent Seven',
    '23 September 2016',
    133,
    'Antoine Fuqua',
    'Seven gun men in the old west gradually come together to help a poor village against savage thieves.'));

app.get('/', function (request, response) {
    response.send(movies);
});

/**
 * Starts listening on the port specified by the configuration.
 */
app.listen(3000, function () {
    console.log('NotFlix is running on port ' + Config.port);
});
