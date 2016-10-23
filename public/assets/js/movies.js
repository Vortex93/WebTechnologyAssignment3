$(function () {

    getMovies();

    /* Events */

    //Handle clicks on movie posters
    $('.row').on('click', 'div .thumbnail', function () {
        var tt = $(this).parent().find('.caption').find('#tt').html(); //Get the tt
        $('.container')
            .slideUp(400, function () {
                openDetailedContent(tt);
            });
    });

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
            $.each(data, function (i, movie) { //Go through each movie in database
                getPoster(movie.tt, function (poster) { //Get the poster link
                    //Add items to the content
                    $('.row').append(
                        $('<div>').addClass('col-xs-6 col-sm-4 col-md-3')
                            .append(
                                $('<div>').addClass('thumbnail')
                                    .append($('<img>').attr('src', poster.url)) //Add the poster
                                    .append($('<div>').addClass('caption')
                                        .append($('<div>').attr('id', 'tt').hide().html(movie.tt)) //Add the tt id
                                        .append($('<h3>').html(movie.title)) //Add the title
                                        .append($('<h5>').html('Rating: ' + (movie.rating ? movie.rating : 'N/A')) //Add the rating
                                            .append($('<h5>').html('Director: ' + movie.director)) //Add the director
                                            .append($('<h5>').html('Date: ' + movie.date)) //Add the publication date
                                            .append($('<p>').html(movie.description)) //Add the description
                                        ))));
                });
            });
        }).fail(function (xhr) {
            window.location.href = 'index.html';
        });
    }

    /**
     * Open the detailed movie content by the tt
     * @param tt unique identification of the movie
     */
    function openDetailedContent(tt) {
        $.get('movie.html')
            .done(function (data) {
                data = $(data);

                //Update the tt in the detailed content
                data.find('#tt').hide().html(tt);

                //Fill the container with data
                $('.container')
                    .html(data) //Fill it in with data
                    .fadeIn(); //Fade in the detailed content
            });
    }

    /**
     * Get the image url of the poster using omdbapi.com
     * @param tt The id of the movie
     */
    function getPoster(tt, callback) {
        var posters = getSessionPosters();
        if (posters) { //Has posters
            var poster = getSessionPoster(tt);
            if (poster) { //Poster is found
                callback(poster.url);
            }
        } else { //Does not have poster
            window.sessionStorage.setItem('posters', JSON.stringify([])); //Add empty array
        }

        if (!posters || !poster) { //Whether the posters was empty or there wasn't a poster
            //Get the poster from omdbapi.com
            getPosterFromApi(tt, function (poster) {
                pushSessionPoster(tt, poster.url); //Push to session
                callback(poster);
            });
        }
    }

    /**
     * Get the poster url from omdbapi.com
     * @param tt unique identifier of the movie
     * @param callback the function to call when the url is found
     */
    function getPosterFromApi(tt, callback) {
        //Get the poster url from omdbapi
        $.ajax({
            dataType: 'json',
            type: 'GET',
            url: 'http://www.omdbapi.com/?i=' + tt,
            async: false
        }).done(function (data) {
            pushSessionPoster(tt, data.Poster);
            callback({tt: tt, url: data.Poster});
        }).fail(function () {
            window.location.href = 'index.html';
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