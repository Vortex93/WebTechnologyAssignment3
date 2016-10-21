/**
 * Packages
 */
var Express = require('express');

/**
 * Models
 */
var User = require('../models/user'); //User model

/**
 * Configure the router
 */
var router = Express.Router();

/**
 * Get a list of users based on query.
 *
 * If the queries are not specified, this will returns a
 * list of all users currently in database.
 */
function getUsers(request, response, next) {
    var userId = request.query['userId'];
    var firstName = request.query['firstName'];
    var middleName = request.query['middleName'];
    var lastName = request.query['lastName'];
    var username = request.query['username'];

    User.query(userId, firstName, middleName, lastName, username)

        .then(function (users) { //Get users
            response.json(users);
        })

        .catch(function (error) { //Handle error
            next(error);
        });
}

/**
 * Returns a user specified by the userId.
 */
function getUserById(request, response, next) {
    var userId = request.params['userId'];

    var error;
    User.findById(userId)

        .then(function (user) { //Get user
            if (!user) {
                error = new Error('Not authorized');
                error.status = 401;
                throw error;
            } else {
                response.json(user);
            }
        })

        .catch(function (error) { //Handle error
            next(error);
        });
}

/**
 * Adds a user to the database.
 */
function postUser(request, response, next) {
    var firstName = request.body.firstName;
    var middleName = request.body.middleName;
    var lastName = request.body.lastName;
    var username = request.body.username;
    var password = request.body.password;

    var error;
    User.findLast()

        .then(function (user) { //Get last user
            //Get new user id for the new user based on the last id
            var newId = user ? user._userId + 1 : 0;

            //Create new user using user properties and new userId
            this.user = new User();
            this.user._userId = newId;
            this.user.firstName = firstName;
            this.user.middleName = middleName;
            this.user.lastName = lastName;
            this.user.username = username;
            this.user.password = password;

            return User.findByUsername(username);
        })

        .then(function (user) {
            if (user.username == this.user.username) {
                error = new Error('Username already exists');
                error.status = 409;
                throw error;
            } else {
                //Check for validation errors
                var validation = this.user.validateSync();
                if (validation) {
                    error = new Error(validation);
                    error.status = 400;
                    throw error;
                } else {
                    return this.user.save();
                }
            }
        })

        .then(function () { //Handle the saving of user
            response.status(201).json({message: 'Created'});
        })

        .catch(function (error) { //Handle error
            next(error);
        });
}

/**
 * Router methods
 */
router.get('/', getUsers);
router.get('/:userId', getUserById);
router.post('/', postUser);

module.exports = router;