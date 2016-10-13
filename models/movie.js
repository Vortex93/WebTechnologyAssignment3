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
    }]
});

/**
 * Search movies in the database.
 */
MovieSchema.statics.query = function (tt, title, date, length, director, description) {
    var query = {};
    if (tt) query.tt = new RegExp('^' + tt, 'i');
    if (title) query.title = new RegExp('^' + title, 'i');
    if (date) query.date = date;
    if (length) query.length = length;
    if (director) query.director = new RegExp('^' + director, 'i');
    if (description) query.description = new RegExp('^' + description, 'i');

    //Process the query
    return this.aggregate()
        .match(query)
        .project({ //Specify which fields should be displayed
            tt: 1,
            title: 1,
            date: 1,
            director: 1,
            description: 1,
            rating: {
                $avg: '$ratings.rating' //Calculate the average rating
            }
        });
};

/**
 * Find a movie based on the imdb tt identification.
 */
MovieSchema.statics.findByTt = function (tt) {
    return this.findOne({tt: tt});
};

module.exports = mongoose.model('Movie', MovieSchema);