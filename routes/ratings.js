/**
 * Packages
 */
var Express = require('express');

/**
 * Models
 */
var User = require('../models/user');
var Movie = require('../models/movie');
var Rating = require('../models/rating');

/**
 * Configure the router
 */
var router = Express.Router();

/**
 * Get ratings from the currently logged in user.
 */
router.get('/', getRatings);

/**
 * Get a rating specified by the id.
 */
router.get('/:ratingId', function (request, response));

/**
 * Add new rating.
 */
router.post('/', function (request, response) {
    var username = request.token.username;
    var tt = request.body.tt;
    var ratingValue = request.body.rating;

    var query = Rating.findByUsername(username);
    query.then(function (ratings) {
        this.ratings = ratings;
        return Movie.findByTt(tt);
    }).then(function (movie) {
        if (!movie)
            throw new Error('Movie not found');
        this.movie = movie;
        return User.findByUsername(username);
    }).then(function (user) {
        if (!user)
            throw new Error('User not found');

        this.user = user;
        if (this.ratings.length > 0) {
            for (var i = 0; i < this.ratings.length; i++) {
                var rating = this.ratings[i];
                if (rating.userId == user.userId) {
                    throw new Error('You have already rated this movie');
                }
            }
        }
        return Rating.findLast();
    }).then(function (rating) {
        this.lastRating = rating;
        var newId = lastRating ? lastRating._ratingId + 1 : 0;

        rating = new Rating();
        rating._ratingId = newId;
        rating.user = this.user;
        rating.movie = this.movie;
        rating.rating = ratingValue;

        var error = rating.validateSync();
        if (error) {
            throw new Error(error);
        } else {
            rating.save();
            movie.ratings.push({userId: user.userId, rating: rating.rating});
            movie.save();
            response.sendStatus(201);
        }
    }).catch(function (error) {
        response.status(400).json(error.message);
        throw error;
    });
});

/**
 * Updates rating.
 */
router.put('/:ratingId', function (request, response) {
    var username = request.token.username;
    var ratingId = request.params['ratingId'];
    var ratingValue = request.body.rating;

    var query = Rating.findById(ratingId);
    query.then(function (rating) {
        if (!rating)
            throw new Error('Rating not found');

        if (rating.user.username != username) {
            throw new Error('You are not allowed to modify this rating');
        }

        rating.rating = ratingValue;

        var error = rating.validateSync();
        if (error)
            throw error;

        rating.save();
        return Movie.findByTt(rating.tt);
    }).then(function (movie) {
        var rated = 0;
        for (var i = 0; i < movie.ratings.length; i++) {
            var rating = movie.ratings[i];
            rated += rating.rating;
        }
        movie.rating = rated / movie.ratings.length;
        movie.save();
        response.sendStatus(200);
    }).catch(function (error) {
        response.status(400).json(error.message);
    });
});

/**
 * Remove a rating based on the rating id.
 *
 * Authenticated users can remove their own rating, this will also
 * remove it from the movie ratings.
 */
router.delete('/:ratingId', function (request, response) {
    var ratingId = request.params['ratingId'];

    var query = Rating.findById(ratingId);
    query.then(function (rating) {
        if (!rating)
            throw new Error('Rating not found');

        this.rating = rating;
        return Movie.findByTt(rating.movie.tt);
    }).then(function (movie) {
        this.rating.remove();
        for (var i = 0; i < movie.ratings.length; i++) {
            var rating = movie.ratings[i];
            if (this.rating._id.toString() == rating.toString()) {
                movie.ratings.remove(rating);
                break;
            }
        }
        movie.save();
        response.sendStatus(200);
    }).catch(function (error) {
        response.status(400).json(error.message);
    });
});

function getRatings(request, response) {
    //Request
    var username = request.token.username;
    var tt = request.query['tt'];
    var rating = request.query['rating'];

    //Query
    var query = Rating.findByUsername(username);

    //Process
    query
        .then(function (ratings) { //Handle ratings
            response.json(ratings);
        });
}

function getRatingById(request, response) {
    //Request
    var username = request.token.username;
    var ratingId = request.params['ratingId'];

    //Query
    var query = Rating.findById(ratingId);

    //Process
    query
        .then(function (rating) {
            if (!rating || rating.user.username != username)
                throw Error('Rating not found');

            response.json(rating);
        }).catch(function (error) {
        response.status(400).json(error.message);
    });
}

module.exports = router;