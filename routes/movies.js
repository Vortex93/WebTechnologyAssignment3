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
function getMovies(request, response, next) {
    var tt = request.query['tt'];
    var title = request.query['title'];
    var date = request.query['publicationDate'];
    var length = request.query['length'];
    var director = request.query['director'];
    var description = request.query['description'];

    Movie.query(tt, title, date, length, director, description)

        .then(function (movies) { //Handle movies
            response.json(movies); //Respond with the movie list
        })

        .catch(function (error) { //Handle error
            next(error);
        });
}
router.get('/', getMovies);

module.exports = router;