/**
 * Packages
 */
var express = require('express');

var Movie = require('../models/movie');

/**
 * Configure the router
 */
var router = express.Router();

/**
 * Returns a list of movies.
 *
 * If query is specified then this will yield a list of movies
 * that correspond to the search criteria.
 */
router.get('/', function (request, response) {
    var tt = request.query['tt'];
    var title = request.query['title'];
    var date = request.query['publicationDate'];
    var length = request.query['length'];
    var director = request.query['director'];
    var description = request.query['description'];

    //Search for the movie in the database
    var query = Movie.search(tt, title, date, length, director, description);
    query.then(function (movies) {
        response.json(movies);
    }).catch(function (error) {
        response.status(400).json(error);
    });
});

module.exports = router;