$(function () { //When ready

    /* On start */

    //Make the movie rating display only
    $('#movie_rating_value')
        .rating({
            displayOnly: true
        });

    //Get the movie identifier
    var tt = $('#tt').html(); //This is hidden


    //Get movie from database
    getMovie(tt, function (movie) {
        //Get the poster
        var poster = getPosterUrl(tt);
        $('#movie_poster').attr('src', poster.url); //Set the poster

        $('#title').html(movie.title);
        $('#date').html(movie.date);
        $('#length').html(movie.length);
        $('#director').html(movie.director);
        $('#description').html(movie.description);

        //Set the movie average rating
        $('#movie_rating_value')
            .rating('update', movie.rating ? movie.rating : 0);
    });

    //Get the user's rating of the movie
    getUserRating(tt, function (rating) {
        if (rating) {
            $('#user_rating_value')
                .rating('update', rating.rating);
        } else {
            $('#user_rating_value')
                .rating('update', 0);
        }
    });

    /* Events */

    //Listen for clicks on the back button
    $('#back_button').click(function () {
        $('#movies_button').click();
    });

    //Listen for rating change
    $('#user_rating_value').on('rating.change', function (event, ratingValue) {
        updateUserRating(tt, ratingValue, function () {
            getMovie(tt, function (movie) {
                $('#movie_rating_value')
                    .rating('update', movie.rating);
            });
        });
    });

    $('#user_rating_value').on('rating.clear', function (event) {
        removeUserRating(tt, function () {
            getMovie(tt, function (movie) {
                $('#movie_rating_value')
                    .rating('update', movie.rating);
            })
        });
    });


    /* Functions */

    /**
     * Get the poster of the movie.
     * @param tt unique identifier of the movie
     */
    function getPosterUrl(tt) {
        var posters = JSON.parse(window.sessionStorage.getItem('posters'));
        for (var i = 0; i < posters.length; i++) {
            var poster = posters[i];
            if (poster.tt == tt) {
                return poster;
            }
        }
    }

    /**
     * Gets the movie from the database.
     *
     * @param tt unique identification of the movie
     * @param callback function to call when finished
     */
    function getMovie(tt, callback) {
        $.ajax({
            contentType: 'application/json',
            headers: {"Authorization": window.localStorage.getItem('token')},
            data: {'tt': tt},
            type: 'GET',
            url: '/api/movies'
        }).done(function (movie) {
            callback(movie[0]);
        }).fail(function () { //On failure
            window.location.href = 'index.html'; //Go to homepage
        });
    }

    /**
     * Gets the user's rating of the movie.
     * This would call the callback only if it finds a rating
     * of the user.
     *
     * @param tt unique identification of the movie
     * @param callback
     */
    function getUserRating(tt, callback) {
        $.ajax({
            contentType: 'application/json',
            headers: {"Authorization": window.localStorage.getItem('token')},
            type: 'GET',
            url: '/api/ratings'
        }).done(function (ratings) {
            for (var i = 0; i < ratings.length; i++) {
                var rating = ratings[i];
                var user = JSON.parse(window.localStorage.getItem('user'));
                if (rating.movie == tt && rating.user == user._userId) { //Matches tt
                    callback(rating);
                    return;
                }
            }
            callback(null);
        }).fail(function () { //On failure
            window.location.href = 'index.html'; //Go to homepage
        });
    }

    /**
     * Update the rating of the movie based on user who is currently logged in.
     * @param tt unique identification of the movie
     * @param ratingValue the rating value that ranges from 0.5 to 5
     */
    function updateUserRating(tt, ratingValue, callback) {
        getUserRating(tt, function (rating) {
            //Check whether the user already rated or not
            if (rating) { //Already rated
                //UPDATE
                $.ajax({
                    contentType: 'application/json',
                    headers: {"Authorization": window.localStorage.getItem('token')},
                    data: JSON.stringify({
                        rating: ratingValue
                    }),
                    type: 'PUT',
                    url: '/api/ratings/' + rating._ratingId
                }).done(function () {
                    callback();
                }).fail(function () {
                    //TODO: handle failure
                });
            } else { //First time rating
                //CREATE
                $.ajax({
                    contentType: 'application/json',
                    headers: {"Authorization": window.localStorage.getItem('token')},
                    data: JSON.stringify({
                        tt: tt,
                        rating: ratingValue
                    }),
                    type: 'POST',
                    url: '/api/ratings'
                }).done(function () {
                    callback();
                }).fail(function () {
                    //TODO: handle failure
                });
            }
        });
    }

    function removeUserRating(tt, callback) {
        getUserRating(tt, function (rating) {
            $.ajax({
                contentType: 'application/json',
                headers: {"Authorization": window.localStorage.getItem('token')},
                type: 'DELETE',
                url: '/api/ratings/' + rating._ratingId
            }).done(function () {
                callback();
            }).fail(function (xhr) {
                //TODO: handle failure
            });
        });
    }
});