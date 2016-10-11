/**
 * Packages
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Create the movie schema
var MovieSchema = new Schema({
    tt: {type: String, required: true, index: true, unique: true},
    title: {type: String, required: true},
    date: {type: Date, required: true},
    length: {type: Number, required: true},
    director: {type: String, required: true},
    description: {type: String, required: true},
    ratings: [{
        userId: {type: Number, min: 0},
        rating: {type: Number, min: 0.5, max: 5}
    }],
});

/**
 * Returns a list of movies that correspond to the specified criteria.
 *
 * @param tt Unique identifier of movies based on IMDB.
 * @param title The title
 * @param date The publication date
 * @param length The length in minutes
 * @param director The director
 * @param description A small description
 */
MovieSchema.statics.search = function (tt, title, date, length, director, description) {
    var query = {};
    if (tt) query.tt = new RegExp('^' + tt, 'i');
    if (title) query.title = new RegExp('^' + title, 'i');
    if (date) query.date = date;
    if (length) query.length = length;
    if (director) query.director = new RegExp('^' + director, 'i');
    if (description) query.description = new RegExp('^' + description, 'i');

    return this.aggregate()
        .match(query)
        .project({ //Specify which fields should be displayed
            tt: 1,
            title: 1,
            date: 1,
            director: 1,
            description: 1,
            rating: {
                $avg: '$ratings.rating'
            }
        });
};

/**
 * Returns a movie
 *
 * @param tt Unique identifier of movie based on IMDB.
 */
MovieSchema.statics.findByTt = function (tt) {
    return this.findOne({tt: tt});
};

module.exports = mongoose.model('Movie', MovieSchema);