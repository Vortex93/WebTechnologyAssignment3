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

    User.findById(userId)

        .then(function (user) { //Get user
            if (!user) {
                response.sendStatus(404);
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

    User.findLast()

        .then(function (user) { //Get last user
            //Get new user id for the new user based on the last id
            var newId = user ? user._userId + 1 : 0;

            if (user.username == username) {
                error = new Error('Username already exists');
                error.status = 400;
                throw error;
            }

            //Create new user using user properties and new userId
            this.user = new User();
            this.user._userId = newId;
            this.user.firstName = firstName;
            this.user.middleName = middleName;
            this.user.lastName = lastName;
            this.user.username = username;
            this.user.password = password;

            //Check for validation errors
            var validation = this.user.validateSync();
            if (validation) {
                response.status(400).json(validation);
            } else {
                return this.user.save();
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