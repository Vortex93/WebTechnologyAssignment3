var express = require('express');
var jwt = require('jsonwebtoken');

var router = express.Router();

/**
 * Handles the token authorization for the api's.
 *
 * The POST method for the user is not checked for token verification,
 * reason being that the user should be able to add a new user without
 * being registered.
 */
router.use(function (request, response, next) {
    var token = request.headers.authorization; //Get the token from authorization
    var privateKey = request.app.get('privateKey'); //Get private key

    //For some api there is no authorization necessary, therefore
    //the if statement below act as an exception
    if (request.method == "POST" &&
        (request.path == '/users' ||
        request.path == '/authorize')) {
        next();
    } else {
        //Verify the token
        jwt.verify(token, privateKey, function (error, decoded) {
            if (error) {
                response.status(400).json('Invalid token');
            } else {
                var username = decoded.username;
                var query = User.findByUsername(username);
                query.then(function (user) {
                    if (!user)
                        throw new Error('User not found');

                    request.token = decoded;
                    next();
                }).catch(function (error) {
                    response.status(400).json(error);
                });
            }
        });
    }
});

module.exports = router;