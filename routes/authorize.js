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

    console.log(username + " " + password);

    if (!username) {
        response.status(400).json('Username is not defined');
        return;
    }

    if (!password) {
        response.status(400).json('Password is not defined');
        return;
    }

    User.findByUsername(username)

        .then(function (user) {
            if (!user) {
                response.status(401).json({message: 'Wrong username or password'});
            } else {
                if (user.password == password) {
                    var token = jwt.sign({username: username}, privateKey);
                    response.json({token: token});
                } else {
                    response.status(400).json({message: "Wrong username or password"});
                }
            }
        })

        .catch(function (error) {
            next(error);
        });
}

/**
 * Router method
 */
router.post('/', postAuthorize);

module.exports = router;