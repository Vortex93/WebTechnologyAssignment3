/**
 * Packages
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

const visibleFields = 'firstName middleName lastName username';

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
 * Search the database for users based on the
 * search criteria.
 *
 * @param firstName First name of the user.
 * @param middleName Maiden name of the user.
 * @param lastName Last name of the user.
 * @param username Name that is used to authenticate the user.
 */
UserSchema.statics.search = function (userId, firstName, middleName, lastName, username, callback) {
    var query = {};
    if (userId) query._userId = userId;
    if (firstName) query.firstName = new RegExp('^' + firstName, 'i');
    if (middleName) query.middleName = new RegExp('^' + middleName, 'i');
    if (lastName) query.lastName = new RegExp('^' + lastName, 'i');
    if (username) query.username = new RegExp('^' + username, 'i');

    this.find(query,
        visibleFields, //Makes sure that list of users has certain visible fields (Excl. password)
        callback); //Calls the callback
};

/**
 * Find the user given by the userId.
 * @param userId Unique identifier of the user.
 * @param callback The callback function to be called after the execution.
 */
UserSchema.statics.findById = function (userId, callback) {
    try {
        this.findOne(
            {_userId: userId},
            visibleFields, //Makes sure that the user has certain visible fields (Excl. password)
            callback); //Calls the callback
    } catch (error) {
        callback(error);
    }

};

/**
 * Find user based on the username given.
 *
 * @param username Username of the user.
 */
UserSchema.statics.findByUsername = function (username) {
    return this.findOne({username: username})
        .then(function (user) {
            return user;
        });
};

/**
 * Find the last user that has registered.
 * @param callback The callback function to be called after the execution.
 */
UserSchema.statics.findLast = function (callback) {
    return this.findOne().sort( //Get all users and sort them
        {_userId: -1}) //Sort list according to userId Ascending
        .exec(callback); //Calls the callback
};

/**
 * Validations
 */
UserSchema.pre('save', function (callback) {
    //Check for duplicates
    var self = this;
    User.findOne({username: self.username}, visibleFields, function (error, user) {
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