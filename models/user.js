/**
 * Packages
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

const visibleFields = '_userId firstName middleName lastName username';

//Create the user schema
var UserSchema = new Schema({
    _userId: {type: Number, required: true, min: 0, index: true, unique: true},
    firstName: {type: String, required: true},
    middleName: {type: String},
    lastName: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true} //Should be encrypted
});

/**
 * Search users in the database.
 */
UserSchema.statics.query = function (userId, firstName, middleName, lastName, username, callback) {
    var query = {};
    if (userId) query._userId = userId;
    if (firstName) query.firstName = new RegExp('^' + firstName, 'i');
    if (middleName) query.middleName = new RegExp('^' + middleName, 'i');
    if (lastName) query.lastName = new RegExp('^' + lastName, 'i');
    if (username) query.username = new RegExp('^' + username, 'i');

    return this.find(query,
        visibleFields, //Makes sure that list of users has certain visible fields (Excl. password)
        callback) //Calls the callback
        .exec(callback);
};

/**
 * Find a user based on the user id.
 */
UserSchema.statics.findById = function (userId, callback) {
    return this.findOne({_userId: userId}, visibleFields)
        .exec(callback)
};

/**
 * Finds a user based on the username.
 */
UserSchema.statics.findByUsername = function (username, callback) {
    return this.findOne({username: username})
        .exec(callback);
};

/**
 * Find the last user that has registered.
 */
UserSchema.statics.findLast = function (callback) {
    return this.findOne()
        .sort({_userId: -1}) //Sort descending (Highest number first)
        .exec(callback);
};

/**
 * Validations
 */
UserSchema.pre('save', function (callback) {
    //Check for duplicates
    var user = this;
    User.findOne({username: user.username}, visibleFields, function (error, user) {
        callback(error, user);
    });
});
UserSchema.path('firstName').validate(function (firstName) {
    return firstName.length > 0;
}, 'First name can not be empty');

UserSchema.path('lastName').validate(function (lastName) {
    return lastName.length > 0;
}, 'Last name can not be empty');

UserSchema.path('username').validate(function (username) {
    return username.length >= 4;
}, 'Username must be at least 4 characters');

UserSchema.path('password').validate(function (password) {
    return password.length >= 4;
}, 'Password must be at least 4 characters');

//Apply schema to the model
module.exports = User = mongoose.model('User', UserSchema);