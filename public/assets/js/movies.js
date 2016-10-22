$(function () {

    getMovies();

    /* Functions */

    /**
     * Get a list of movies from database.
     */
    function getMovies() {
        $.ajax({
            contentType: 'application/json',
            headers: {"Authorization": window.localStorage.getItem('token')},
            type: 'GET',
            url: '/api/movies'
        }).done(function (data) { //Successfully created account
            $.each(data, function (i, item) { //Go through each movie in database
                getImageUrl(item.tt, function (poster) { //Get the poster link
                    //Add items to the content
                    $('.row').append(
                        $('<div>').addClass('col-xs-6 col-sm-4 col-md-3')
                            .append(
                                $('<div>').addClass('thumbnail')
                                    .append($('<img>').attr('src', poster)) //Add the poster
                                    .append($('<div>').addClass('caption')
                                        .append($('<h3>').html(item.title)) //Add the title
                                        .append($('<h5>').html('Director: ' + item.director)) //Add the director
                                        .append($('<h5>').html('Date: ' + item.date)) //Add the publication date
                                        .append($('<p>').html(item.description)) //Add the description
                                    )
                            )
                    );
                });
            });
        }).fail(function (xhr) {
            window.location.href = 'index.html';
        });
    }

    /**
     * Get the image url of the poster using omdbapi.com
     * @param tt The id of the movie
     */
    function getImageUrl(tt, callback) {
        var posters = getSessionPosters();
        if (!posters) {
            window.sessionStorage.setItem('posters', JSON.stringify([])); //Add empty array
        } else {
            var poster = getSessionPoster(tt);
            if (poster) {
                callback(poster.url);
                return;
            }
        }

        $.ajax({
            dataType: 'json',
            type: 'GET',
            url: 'http://www.omdbapi.com/?i=' + tt,
            async: false
        }).done(function (data) {
            pushSessionPoster(tt, data.Poster);
            callback(data.Poster);
        }).fail(function () {
            callback(null);
        });
    }

    /**
     * Get the posters from session storage.
     * @returns {null}
     */
    function getSessionPosters() {
        try {
            return JSON.parse(window.sessionStorage.getItem('posters'));
        } catch (error) {
            return null;
        }
    }

    /**
     * Get the session poster based on the movie's id.
     * @param tt The id of the movie
     * @returns {*}
     */
    function getSessionPoster(tt) {
        var posters = getSessionPosters();
        for (var i = 0; i < posters.length; i++) {
            var poster = posters[i];
            if (poster.title == tt) {
                return poster;
            }
        }
        return null;
    }

    /**
     * Add a new movie poster to the session storage.
     * @param tt The id of the movie
     * @param url The url of the poster
     */
    function pushSessionPoster(tt, url) {
        var posters = getSessionPosters();
        posters.push({
            tt: tt,
            url: url
        });
        window.sessionStorage.setItem('posters', JSON.stringify(posters));
    }
});