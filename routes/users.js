/**
 * Packages
 */
var Express = require('express');

/**
 * Properties
 */
var User = require('../models/user'); //User model
var Rating = require('../models/rating'); //User model

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
router.get('/', function (request, response) {
    var userId = request.query['userId'];
    var firstName = request.query['firstName'];
    var middleName = request.query['middleName'];
    var lastName = request.query['lastName'];
    var username = request.query['username'];

    User.search(userId, firstName, middleName, lastName, username, function (error, users) {
        if (error) {
            response.status(500).json(error);
        }
        response.json(users); //This gives http status 200 by default
    });
});

/**
 * Returns a user specified by the userId.
 */
router.get('/:userId', function (request, response) {
    var userId = request.params['userId'];

    User.findById(userId, function (error, user) {
        if (error) {
            response.status(500).json(error);
            return;
        }
        response.json(user);
    });
});

/**
 * Adds a user to the database.
 * This will return the id of the user after successfully been added.
 */
router.post('/', function (request, response) {
    var firstName = request.body.firstName;
    var middleName = request.body.middleName;
    var lastName = request.body.lastName;
    var username = request.body.username;
    var password = request.body.password;

    //Find the last user
    User.findLast(function (error, user) {
        if (error)
            throw error;
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

        //Validate user properties
        var error = user.validateSync();
        if (error) {
            response.status(400).json(error);
        } else {
            //Attempt to save the new user
            user.save(function (error) {
                if (error)
                    throw error;
                response.sendStatus(201);
            });
        }
    });
});

router.delete('/', function (request, response) {
    response.sendStatus(403);
});

module.exports = router;