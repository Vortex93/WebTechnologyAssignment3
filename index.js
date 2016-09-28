var Express = require("express");

var express = new Express();

var User = function (lastName, middleName, firstName, userName, password) {
    this.lastName = lastName;
    this.middleName = middleName;
    this.firstname = firstName;
    this.userName = userName;
    this.password = password;
}

var Rating = function (movie, user, stars) {
    this.movie = movie;
    this.user = user;
    this.stars = stars;
}