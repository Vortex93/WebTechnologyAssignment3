/**
 * Created by Derwin on 28-Sep-16.
 */
/**
 * Constructor
 *
 * @param tt Unique number
 * @param title Title of the movie
 * @param date Publication date of the movie
 * @param length Length of the movie in minutes
 * @param director The person who directed the movie
 * @param description A plot description of the movie
 * @constructor
 */

var Movie = function (tt, title, date, length, director, description) {
    this.tt = tt;
    this.title = title;
    this.date = date;
    this.length = length;
    this.director = director;
    this.description = description;
};

/**
 * @returns {*} Returns the tt (unique number)
 */
Movie.prototype.getId = function () {
    return this.tt;
};

/**
 * @returns {*} Returns the movie title.
 */
Movie.prototype.getTitle = function () {
    return this.title;
    s
};

/**
 * @returns {*} Returns the date of the movie.
 */
Movie.prototype.getDate = function () {
    return this.date;
};

/**
 * @returns {*} Returns the length of the movie.
 */
Movie.prototype.getLength = function () {
    return this.length;
};

/**
 * @returns {*} Returns the directory of the movie.
 */
Movie.prototype.getDirector = function () {
    return this.director;
};

module.exports = Movie;