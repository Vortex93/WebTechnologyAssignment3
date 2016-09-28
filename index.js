/**
 * Modules
 */
var express = require("express");

/**
 * Classes
 */
var Movie = require("./model/movie");
var User = require("./model/user");
var Rating = require("./model/rating");

/**
 * Properties
 */
var movies = [];
var users = [];

var app = express();
console.log('Starting...');

app.get("/", function (request, response) {
    response.send("Hello World");
});
