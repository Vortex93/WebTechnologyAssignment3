/**
 * Created by Derwin on 04-Oct-16.
 */
var Express = require('express');
var jwt = require('jsonwebtoken');

var User = require('../models/user');

//Property
var privateKey = 'Aruba';

//Router object
var router = Express.Router();

/**
 * Authenticate the user.
 */
function postAuthorize(request, response, next) {
    var username = request.body.username;
    var password = request.body.password;

    //Pre-conditions
    if (!username) {
        response.status(400).json('Username is not defined');
        return;
    }

    if (!password) {
        response.status(400).json('Password is not defined');
        return;
    }

    User.findByUsername(username)

        .then(function (user) { //Handle user retrieval
            if (!user) { //User does not exist
                response.status(404).json({message: 'User does not exists'});
            } else { //User exists
                if (user.password == password) { //Password is correct
                    var token = jwt.sign({username: username}, privateKey);
                    response.json({token: token});
                } else { //Incorrect password
                    response.status(403).json({message: "Password incorrect"});
                }
            }
        })

        .catch(function (error) { //Handle error
            next(error);
        });
}

/**
 * Verification for the token
 */
function getAuthorize(request, response, next) {
    var username = request.token.username;

    var error;
    User.findByUsername(username)

        .then(function (user) {
            if (user) {
                response.json({
                    _userId: user._userId,
                    username: user.username,
                    firstName: user.firstName,
                    middleName: user.middleName,
                    lastName: user.lastName
                });
            } else {
                error = new Error('Invalid Token');
                error.status = 400;
                throw error;
            }
        })

        .catch(function (error) { //Handle error
            next(error);
        });
}

/**
 * Router method
 */
router.post('/', postAuthorize);
router.get('/', getAuthorize);

module.exports = router;