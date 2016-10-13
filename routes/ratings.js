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
 * Get all the ratings based on the username.
 */
function getRatings(request, response, next) {
    var username = request.token.username;
    var tt = request.query['tt'];
    var rating = request.query['rating'];

    User.findByUsername(username)

        .then(function (user) {
            if (!user) {
                error = new Error('Not authorized');
                error.status = 401;
                throw error;
            } else {
                return Rating.find({user: user._userId});
            }
        })

        .then(function (ratings) {
            response.json(ratings);
        })

        .catch(function (error) {
            next(error);
        });
}

/**
 * Get a rating based on the id of the rating.
 */
function getRatingById(request, response, next) {
    var username = request.token.username;
    var ratingId = request.params['ratingId'];

    var error;
    User.findByUsername(username)

        .then(function (user) { //Handle user
            if (!user) {
                error = new Error('Not authorized');
                error.status = 401;
                throw error;
            } else {
                //Query for rating with rating id and user id
                return Rating.find({user: user._userId, _ratingId: ratingId});
            }
        })

        .then(function (rating) { //Handle rating
            if (!rating) {
                error = new Error('Rating not found');
                error.status = 404;
                throw error;
            } else {
                response.json(rating); //Respond with rating
            }
        })

        .catch(function (error) { //Handle error
            next(error);
        });
}

/**
 * Create a rating
 */
function postRating(request, response, next) {
    var username = request.token.username;
    var tt = request.body.tt;
    var ratingValue = request.body.rating;

    var error;

    User.findByUsername(username)

        .then(function (user) {
            if (!user) {
                error = new Error('Not authorized');
                error.status = 401;
                throw error;
            } else {
                this.user = user;
                return Movie.findByTt(tt);
            }
        })

        .then(function (movie) {
            if (!movie) {
                error = new Error('Movie not found');
                error.status = 404;
                throw error;
            } else {
                this.movie = movie;
                return Rating.findByTt(tt);
            }
        })

        .then(function (ratings) {
            this.ratings = ratings.filter(function (rating) {
                return rating.user == this.user._userId;
            });

            if (this.ratings.length == 0) {
                return Rating.findLast();
            } else {
                error = new Error('Already rated');
                error.status = 400;
                throw error;
            }
        })

        .then(function (rating) {
            var ratingId = rating ? rating._ratingId + 1 : 0;

            this.rating = new Rating();
            this.rating._ratingId = ratingId;
            this.rating.user = this.user._userId;
            this.rating.rating = ratingValue;
            this.rating.movie = tt;

            var validation = this.rating.validateSync();
            if (validation) {
                error = new Error(validation);
                error.status = 400;
                throw error;
            } else {
                return this.rating.save();
            }
        })

        .then(function (movie) {
                this.movie.ratings.push({userId: this.user._userId, rating: this.rating.rating});
                return this.movie.save();
        })

        .then(function () {
            response.sendStatus(201);
        })

        .catch(function (error) {
            next(error);
        });
}

/**
 * Update rating given by the id.
 */
function putRating(request, response, next) {
    var username = request.token.username;
    var ratingId = request.params['ratingId'];
    var ratingValue = request.body.rating;

    var error;
    Rating.findOne({_ratingId: ratingId})

        .then(function (rating) { //Handle rating
            if (!rating) {
                error = new Error('Rating not found');
                error.status = 404;
                throw error;
            } else {
                this.rating = rating;
                return User.findByUsername(username);
            }
        })

        .then(function (user) { //Handle user
            if (!user) {
                error = new Error('Not authorized');
                error.status = 401;
                throw error;
            } else {
                this.user = user;
                if (this.rating.user == this.user._userId) {
                    error = new Error('Not authorized');
                    error.status = 401;
                    throw error;
                } else {
                    this.rating.rating = ratingValue;

                    //Validate the update
                    var validation = this.rating.validateSync();
                    if (validation) {
                        error = new Error(validation);
                        error.status = 400;
                        throw error;
                    }

                    return this.rating.save();
                }
            }
        })

        .then(function (rating) { //Handle save
            response.sendStatus(200); //OK
        })

        .catch(function (error) { //Handle error
            next(error);
        });
}

/**
 * Remove rating given by the id.
 */
function deleteRating(request, response, next) {
    var username = request.token.username;
    var ratingId = request.params['ratingId'];

    var error;
    User.findByUsername(username)

        .then(function (user) {
            if (!user) {
                error = new Error('Not authorized');
                error.status = 401;
                throw error;
            } else {
                //Query the rating
                return Rating.findOne({_ratingId: ratingId});
            }
        })

        .then(function (rating) { //Handle rating
            if (!rating) {
                error = new Error('Rating not found');
                error.status = 404;
                throw error;
            } else {
                this.rating = rating;
                return Movie.findByTt(rating.movie);
            }
        })

        .then(function (movie) { //Handle movie
            if (!movie) {
                error = new Error('Movie not found');
                error.status = 404;
                throw error;
            } else {
                this.movie = movie;
                //Go through all the ratings in movie
                for (var i = 0; i < this.movie.ratings.length; i++) {
                    var rating = this.movie.ratings[i];
                    if (rating.userId == this.rating.user) { //Check rating with movie rating
                        this.movie.ratings.splice(i, 1); //Remove the item from array
                        break;
                    }
                }
                return this.movie.save();
            }
        })

        .then(function () { //Handle movie
            this.rating.remove(); //Remove the main rating
            response.sendStatus(200);
        })

        .catch(function (error) { //Handle error
            next(error);
        });
}

/**
 * Router methods
 */
router.get('/', getRatings);
router.get('/:ratingId', getRatingById);
router.post('/', postRating);
router.put('/:ratingId', putRating);
router.delete('/:ratingId', deleteRating);

module.exports = router;