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

    Rating.findByTt(tt)
        .then(function (ratings) { //Get all the ratings
            //Filter the ratings based on the username
            this.ratings = ratings.filter(function (rating) {
                return rating.user.username == username;
            });

            //Respond with the ratings to the user
            response.json(this.ratings);
        })

        .catch(function (error) { //Handle error
            next(error);
        });
}

/**
 * Get a rating based on the id of the rating.
 */
function getRatingById(request, response, next) {
    var username = request.token.username;
    var ratingId = request.params['ratingId'];


    User.findByUsername({username: username})

        .then(function (user) { //Handle user
            if (!user) {
                response.sendStatus(401); //User not found
            } else {
                //Query for rating with rating id and user id
                return Rating.find({user: user._id, _ratingId: ratingId});
            }
        })

        .then(function (rating) { //Handle rating
            if (!rating) {
                response.sendStatus(404); //Rating not found
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

    Rating.findByTt(tt)

        .then(function (rating) { //Handle rating
            if (rating) {
                response.status(400).json({message: 'Already rated'});
            } else {
                return User.findByUsername(username);
            }
        })

        .then(function (user) { //Handle user
            if (!user) {
                response.sendStatus(401); //User not found
            } else {
                this.user = user;
                return Movie.findByTt(tt); //Query movie based on tt
            }
        })

        .then(function (movie) { //Handle movie
            if (!movie) {
                response.status(404).json({message: 'TT specified does not exist'});
            } else {
                this.movie = movie;
                return Rating.findLast();
            }
        })

        .then(function (rating) { //Handle last rating
            //Get new id from the last rating's id
            var ratingId = rating ? rating._ratingId + 1 : 0;

            //Create a new rating
            this.rating = new Rating;
            this.rating._ratingId = ratingId;
            this.rating.user = this.user._userId;
            this.rating.movie = this.movie.tt;
            this.rating.rating = ratingValue;

            //Check validation error
            var validation = this.rating.validateSync();
            if (validation) {
                response.status(400).json(validation);
            }

            return this.rating.save();
        })

        .then(function () { //Handle save
            //Save the rating to movie
            this.movie.ratings.push({
                userId: this.user.userId,
                rating: ratingValue
            });

            this.movie.save();

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

    Rating.findById(ratingId)

        .then(function (rating) { //Handle rating
            if (!rating) {
                response.sendStatus(404); //Rating not found
            } else {
                this.rating = rating;
                return User.findByUsername(username);
            }
        })

        .then(function (user) { //Handle user
            if (!user) {
                response.sendStatus(401); //Not authorized
            } else {
                this.user = user;
                if (this.rating.user == this.user._userId) {
                    response.sendStatus(401); //Not authorized to change someone else's rating
                } else {
                    this.rating.rating = ratingValue;

                    //Validate the update
                    var validation = this.rating.validateSync();
                    if (validation) {
                        response.status(400).json(validation);
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

    User.findByUsername(username)

        .then(function (user) {
            if (!user) {
                response.sendStatus(401); //Not authorized
            } else {
                //Query the rating
                return Rating.findById(ratingId);
            }
        })

        .then(function (rating) { //Handle rating
            if (!rating) {
                response.sendStatus(404); //Rating not found
            } else {
                this.rating = rating;
                return Movie.findByTt({tt: rating.movie});
            }
        })

        .then(function (movie) { //Handle movie
            if (!movie) {
                response.sendStatus(404); //Movie not found
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

        .then(function (movie) { //Handle movie
            this.rating.remove(); //Remove the main rating
            response.sendStatus(200);
        })

        .catch(function (error) { //Handle error
            next(error);
        })

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