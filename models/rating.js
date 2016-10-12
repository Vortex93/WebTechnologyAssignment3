/**
 * Packages
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

//Create the rating schema
var RatingSchema = new Schema({
    _ratingId: {type: Number, min: 0, required: true},
    user: {type: Number, min: 0, required: true},
    movie: {type: String, required: true},
    rating: {type: Number, min: 0.5, max: 5.0, required: true}
});

/**
 * Returns a list of ratings based on the specified criteria.
 *
 * @param userId User unique identifier
 * @param movieTt Movie uniquer identifier
 * @param rating Rating for the movie
 * @param callback Callback function to be called when the search finished.
 */
RatingSchema.statics.search = function (movieTt, ratingValue) {

    //If values below are undefined, assign an empty string
    if (!movieTt) movieTt = '';
    if (!ratingValue) ratingValue = '';

    //Begin the finding process
    return this.find()
        .populate({path: 'user movie', select: '-password -ratings'}) //Exclude password
        .then(function (ratings) {
            //Regular expression
            var movieTtRegExp = new RegExp('^' + movieTt, 'i');
            var ratingRegExp = new RegExp(ratingValue);

            //Filter down the ratings based on the parameters userId and movieTt
            ratings = ratings.filter(function (rating) {
                return movieTtRegExp.exec(rating.movie.tt) &&
                    ratingRegExp.exec(rating.rating);
            });
            return ratings;
        });
};

RatingSchema.statics.findById = function (ratingId) {
    return this.findOne({_ratingId: ratingId})
        .populate({path: 'user movie', select: '-password -ratings'});
};

RatingSchema.statics.findByTt = function (tt, username, callback) {
    this.find()
        .populate({path: 'user movie', select: '-password -ratings'})
        .exec(function (error, ratings) {
            var filtered = ratings.filter(function (rating) {
                return rating.user.username == username &&
                    rating.movie.tt == tt;
            });
            callback(error, filtered);
        });
};

RatingSchema.statics.findByUsername = function (username) {
    return this.find()
        .populate('user movie', '-password -ratings')
        .then(function (ratings) {
            ratings = ratings.filter(function (rating) {
                return rating.user.username == username;
            });
            return ratings;
        });
};


RatingSchema.statics.findLast = function (callback) {
    return this.findOne().sort(
        {_ratingId: -1})
        .exec(callback);
};

/**
 * Validations
 */
RatingSchema.pre('save', function (callback) {
    var self = this;
    Rating.findOne({user: self.user, movie: self.movie}, function (error, rating) {
        if (rating) {
            callback('rating already exists', rating);
        } else {
            callback(null, rating);
        }
    });
});


RatingSchema.path('user').validate(function (user) {
    return user != undefined;
}, 'User must be defined');

RatingSchema.path('movie').validate(function (movie) {
    return movie != undefined;
}, 'Movie must be defined');

RatingSchema.path('rating').validate(function (rating) {
    return rating != undefined && rating >= 0.5 && rating <= 5;
}, 'Rating should be from 0.5 to 5');


module.exports = Rating = mongoose.model('Rating', RatingSchema);