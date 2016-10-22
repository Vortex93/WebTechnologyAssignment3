/**
 * Packages
 */
var mongoose = require('mongoose');
var assert = require('assert');
var supertest = require('supertest');
var jwt = require('jsonwebtoken');

/**
 * Connect to mongoose server
 */
var mongoUrl = 'mongodb://10.0.0.11'; //Please insert your url
mongoose.Promise = global.Promise;
mongoose.connect(mongoUrl);

var Movie = require('../models/movie');
var User = require('../models/user');
var Rating = require('../models/rating');

var server = supertest.agent('http://localhost:3000');
var token = jwt.sign({username: 'admin'}, 'Aruba');

/**
 * Add user for testing
 */
var admin = new User({
    _userId: 0,
    username: 'admin',
    password: 'password',
    firstName: 'Derwin',
    lastName: 'Tromp'
});

var user = new User({
    _userId: 1,
    username: 'user',
    password: 'password',
    firstName: 'User',
    lastName: 'None'
});

admin.save();

/**
 * Create movie for testing
 */
var movie = new Movie({
    tt: 'tt2140479',
    title: 'The Accountant',
    length: 144,
    director: 'Gavin O Connor',
    description: 'As a math savant uncooks the books for a new client, the Treasury department closes in on his activities and the body count starts to rise',
    ratings: [{
        userId: 0,
        rating: 2
    }]
});

var rating = new Rating({
    _ratingId: 0,
    user: 0,
    movie: 'tt2140479',
    rating: 4
});

movie.save();

/**
 * Movies
 */
describe('Movie:', function () {

    describe('GET /movies', function () {
        it('should return 200 with a token', function (done) {
            server
                .get('/api/movies')
                .set('Authorization', token)
                .expect(200)
                .end(function (error) {
                    done(error);
                })
        });

        it('should return 400 without a token', function (done) {
            server
                .get('/api/movies')
                .expect(400)
                .end(function (error) {
                    done(error);
                });
        });
    });
});

/**
 * Users
 */
describe('User:', function () {

    before(function () {
        User.find({username: user.username}).remove().exec();
    });

    after(function () {
        User.find({username: user.username}).remove().exec();
    });

    describe('POST /users', function () {
        it('should create a user', function (done) {
            server
                .post('/api/users')
                .send(user)
                .expect(201)
                .end(function (error) {
                    done(error);
                });
        });

        it('should fail the second time', function (done) {
            server
                .post('/api/users')
                .send(user)
                .expect(400)
                .end(function (error) {
                    done(error);
                });
        });
    });

    describe('GET /users', function () {
        it('should return 200 with a token', function (done) {
            server
                .get('/api/users')
                .set('Authorization', token)
                .expect(200)
                .end(function (error) {
                    done(error);
                });
        });

        it('should return 400 without a token', function (done) {
            server
                .get('/api/users')
                .expect(400)
                .end(function (error) {
                    done(error);
                });
        });
    });
});

/**
 * Ratings
 */
describe('Rating: ', function () {

    describe('GET /ratings', function () {
        it('should return 200 with token', function (done) {
            server
                .get('/api/ratings')
                .set('Authorization', token)
                .expect(200)
                .end(function (error) {
                    done(error);
                });
        });

        it('should return 400 without a token', function (done) {
            server
                .get('/api/ratings')
                .expect(400)
                .end(function (error) {
                    done(error);
                });
        })
    });

    describe('POST /rating', function () {

        before(function () {
            server
                .post('/api/ratings')
                .send({tt: rating.movie, rating: 2});
        });

        after(function () {
            //Make sure to remove the rating after testing
            Rating.find({user: 0}).remove().exec();
        });

        it('should give an error on invalid input', function (done) {
            server
                .post('/api/ratings')
                .send({tt: rating.movie, rating: 0})
                .expect(400)
                .end(function (error) {
                    done(error);
                });
        });

        it('should add a new rating', function (done) {
            server
                .post('/api/ratings')
                .set('Authorization', token)
                .send({tt: rating.movie, rating: rating.rating})
                .expect(201)
                .end(function (error) {
                    done(error);
                });
        });

        it('should give an error the second time', function (done) {
            server
                .post('/api/ratings')
                .send({tt: rating.movie, rating: rating.rating})
                .expect(400)
                .end(function (error) {
                    done(error);
                });
        });

    });

    describe('PUT /ratings', function () {

        before(function () {
            new Rating({
                _ratingId: 1,
                user: 1,
                movie: rating.movie,
                rating: rating.rating
            }).save();
        });

        after(function () {
            Rating.find({_ratingId: 1}).remove().exec();
        });

        it('should update a rating', function (done) {
            server
                .put('/api/ratings/1')
                .set('Authorization', token)
                .send({tt: rating.movie, rating: 1})
                .expect(200)
                .end(function (error) {
                    done(error);
                });
        });

        it('should give error on invalid rating', function (done) {
            server
                .put('/api/ratings/1')
                .set('Authorization', token)
                .send({tt: rating.movie, rating: 0})
                .expect(400)
                .end(function (error) {
                    done(error);
                })
        });

        it('should give error on non-existent movie', function (done) {
            server
                .put('/api/ratings/1')
                .set('Authorization', token)
                .send({tt: 'tt999999', rating: 0})
                .expect(400)
                .end(function (error) {
                    done(error);
                })
        });
    });

    describe('DELETE /ratings', function () {

        before(function () {
            new Rating({
                _ratingId: 1,
                user: 0,
                movie: rating.movie,
                rating: rating.rating,
            }).save();
        });


        it('should remove the rating', function (done) {
            server
                .delete('/api/ratings/1')
                .set('Authorization', token)
                .expect(200)
                .end(function (error) {
                    done(error);
                });
        });

        it('should return not found second time', function (done) {
            server
                .delete('/api/ratings/1')
                .set('Authorization', token)
                .expect(404)
                .end(function (error) {
                    done(error);
                });
        });
    });

});