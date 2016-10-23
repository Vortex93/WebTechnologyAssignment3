$(function () {
    verifyToken(); //Verify whether the user is logged in

    /* Events */

    //Handle clicks on navigation bar buttons
    $('button[id*="_button"], a[id*="_button"]').click(function () {
        var buttonName = $(this).html();
        var url;
        switch (buttonName) {
            case 'Home':
                //TODO: This might change to home.html
                break;
            case 'Movies':
                url = 'movies.html';
                break;
            case 'Users':
                url = 'users.html';
                break;
            case 'Register':
                url = 'register.html';
                break;
            case 'Log In':
                url = 'login.html';
                break;
        }
        loadPage(url);
    });

    //Handle the log out button
    $('#log_out_button').click(function () {
        logout();
    });


    /* Functions */

    /**
     * Loads page into the main container.
     * @param url The url to load.
     */
    function loadPage(url) {
        if (url) {
            $('#content').fadeOut(50, function () {
                $('#content')
                    .load(url, null, function () {
                        setTimeout(function () {
                            $('#content').fadeIn(100);
                        }, 25);
                    });
            });
        }
    }

    /**
     * Remove the token from the browser.
     */
    function logout() {
        window.localStorage.removeItem('token');
        window.location.href = 'index.html';
    }

    /**
     * Verify whether the user is logged in.
     */
    function verifyToken() {
        var token = window.localStorage.getItem('token');

        $.ajax({
            contentType: 'application/json',
            headers: {"Authorization": token},
            dataType: "json",
            type: 'GET',
            url: '/api/authorize'
        }).done(function (data) { //Valid token
            showAuthorizedButtons();
            window.localStorage.setItem('user', JSON.stringify(data)); //Set user properties in local storage
            $('#user')
                .children('a')
                .html(data.lastName + ", " + data.firstName);
        }).fail(function (xhr) { //No valid token
            window.localStorage.removeItem('token');
            showNonAuthorizedButtons();
        });
    }

    function showAuthorizedButtons() {
        $('#user').show();
        $('#movies_button').show();
        $('#users_button').show();
    }

    function showNonAuthorizedButtons() {
        $('#log_in_button').show();
        $('#register_button').show();
    }

});