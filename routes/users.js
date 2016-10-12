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
 * Returns a list of users that are registered on the database.
 *
 * If query is specified then this will yield a list of users
 * that correspond to the search criteria.
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
 * This will return the id of the user after successfully been added.
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

            //Create new user using user properties and new userId
            user = new User();
            user._userId = newId;
            user.firstName = firstName;
            user.middleName = middleName;
            user.lastName = lastName;
            user.username = username;
            user.password = password;

            //Check for validation errors
            var error = user.validateSync();
            if (error) {
                error.status = 400;
                next(error);
            } else {
                return user.save();
            }
        })

        .then(function (user) { //Handle the saving of user
            user = user.select('-password');
            response.status(201).json({message: 'Created', user: user});
        })

        .catch(function (error) { //Handle error
            next(error);
        });
}

router.get('/', getUsers);
router.get('/:userId', getUserById);
router.post('/', postUser);

router.delete('/', function (request, response) {
    response.sendStatus(403);
});

module.exports = router;