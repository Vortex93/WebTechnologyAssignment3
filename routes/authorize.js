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
 * This yield an error to the user to use the POST method.
 */
router.get('/', function (request, response) {
    response.status(400).json('Authorization is not supported through GET method');
});

/**
 * Authenticates the user to use the api.
 *
 * Requirements:
 * - username has to be defined in the body.
 * - password has to be defined in the body.
 * - password must match the user's password
 * - user has to exist.
 */
router.post('/', function (request, response) {
    var username = request.body.username;
    var password = request.body.password;

    if (!username){
        response.status(400).json('Username is not defined');
        return;
    }

    if (!password){
        response.status(400).json('Password is not defined');
        return;
    }

    var query = User.findByUsername(username);
    query.then(function (user) {
        if (!user)
            throw new Error('User not found');

        if (user.password == password) {
            var token = jwt.sign({username: username}, privateKey);
            response.send(token);
        } else {
            throw new Error('Password is incorrect');
        }
    }).catch(function (error) {
        response.status(400).json(error.message);
    });
});

module.exports = router;