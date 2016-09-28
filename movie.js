/**
 * Created by Derwin on 28-Sep-16.
 */
var Movie = function(tt, title, date, length, directory, description) {
    this.tt = tt;
    this.title = title;
    this.data = date;
    this.length = length;
    this.directory = directory;
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
    return this.title;s
};

Movie.prototype.getLength = function () {
    return this.length;
};

module.exports = Movie;