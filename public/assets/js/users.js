$(function () {

    getUsers();

    /* Events */

    /*
     * Uses delegated binding to listen for new objects created
     * rather than the direct binding '.click()'
     * */
    $('tbody').on('dblclick', 'tr', function () { //Double clicked
        var index = $(this).children('td:first-child').html();
        $('.container')
            .slideUp(400, function () {
                openDetailedContent(index - 1); //by id
            });
    });

    /* Functions */

    /**
     * Open the detailed page of the user.
     * @param id The id of the user.
     */
    function openDetailedContent(id) {
        $.get('user.html')
            .done(function (data) {
                $('.container')
                    .fadeIn()
                    .html(data);

                //Get user based on id
                $.ajax({
                    contentType: 'application/json',
                    headers: {"Authorization": window.localStorage.getItem('token')},
                    type: 'GET',
                    url: '/api/users/' + id
                }).done(function (data) { //Handle user data
                    $('#username').html(data.username);
                    $('#firstName').html(data.firstName);
                    $('#middleName').html(data.middleName);
                    $('#lastName').html(data.lastName);
                }).fail(function (xhr) { //No valid token
                    window.location.href = 'index.html';
                });

                getRatings(id, function (ratings) {
                    $.each(ratings, function (i, rating) {
                        getMovie(rating.movie, function (movie) {
                            $('#ratings_table tbody')
                                .append(
                                    $('<tr>')
                                        .append($('<td>').hide().html(movie.tt))
                                        .append($('<td>').html(movie.title))
                                        .append($('<td>').html(rating.rating))
                                );
                        });
                    })
                })
            });
    }

    /**
     * Get all the ratings from the database.
     * @param id The id of the user.
     */
    function getRatings(id, callback) {
        $.ajax({
            contentType: 'application/json',
            headers: {"Authorization": window.localStorage.getItem('token')},
            type: 'GET',
            url: '/api/ratings'
        }).done(function (data) {
            if (data[0].user == id) { //Current user
                callback(data);
            } else {
                $('#ratings_table').parent().hide(); //Hide the ratings
            }
        }).fail(function (xhr) {
            //todo: implement some error
        })
    }

    /**
     * Get movie based on the tt (id of the movie)
     * @param id The tt uniquer identifier
     */
    function getMovie(id, callback) {
        $.ajax({
            contentType: 'application/json',
            headers: {"Authorization": window.localStorage.getItem('token')},
            data: {"tt": id},
            type: 'GET',
            url: '/api/movies'
        }).done(function (data) {
            callback(data[0]);
        }).fail(function (xhr) {
            //todo: implement some error
        });
    }

    /**
     * Get list of users from the database.
     */
    function getUsers() {
        $.ajax({
            contentType: 'application/json',
            headers: {"Authorization": window.localStorage.getItem('token')},
            type: 'GET',
            url: '/api/users'
        }).done(function (data) { //Valid token
            $.each(data, function (i, item) {
                $('#users_table tbody').append(
                    $('<tr>')
                        .append($('<td>').html(i + 1))
                        .append($('<td>').html(item.username))
                        .append($('<td>').html(item.firstName))
                        .append($('<td>').html(item.middleName))
                        .append($('<td>').html(item.lastName))
                );
            });
        }).fail(function (xhr) { //No valid token
            window.location.href = 'index.html';
        });
    }
});