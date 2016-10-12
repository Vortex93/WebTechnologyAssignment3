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

    Movie.query(tt, title, date, length, director, description).exec()

        //Get all movies from search properties
        .then(function (movies) {
            this.movies = movies;
        })

        //Send response
        .then(function () {
            response.json(this.movies);
        })

        //Handle error
        .catch(function (error) {
            //TODO handle error
        });
});

module.exports = router;