$(function () {
    "use strict";

    //todo remove codes below
    //For testing purposes
    $('#username').val("admin");
    $('#password').val("password");

    /* Events */

    $('.input').keypress(function (e) {
        if (e.which == 13) {
            $('#login_form').submit();
        }
    });

    $('#login_form').submit(login);


    $('#cancel_button').click(function () {
        window.location.href = "index.html";
    });

    $('form input').change(function () {
        $('form .alert') //Hide the alert
            .removeClass('alert-danger alert-success')
            .fadeOut();

        $('.input-group') //Remove the red border on input
            .removeClass('has-error');
    });

    /* Functions */

    /**
     * Login procedure
     */
    function login(e) {
        e.preventDefault(); //Prevent the form from reloading page
        $('form [type="submit"]').button('loading'); //Show loading button

        //Gather request data
        var username = $('#username').val();
        var password = $('#password').val();

        $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({
                username: username,
                password: password
            }),
            dataType: "json",
            type: 'POST',
            url: '/api/authorize'
        }).done(function (data) { //Successful login
            $('form .alert')
                .html('Success')
                .addClass('alert-success')
                .fadeIn(400, function () { //Display the alert
                    $('.panel')
                        .fadeOut(300, function () { //Fade out the panel
                            window.localStorage.setItem('token', data.token);
                            window.location.href = "index.html"; //Redirect to home
                        });
                });
        }).fail(function (xhr) { //Failed login
                $('form .alert')
                    .html(xhr.responseJSON.message)
                    .addClass('alert-danger')
                    .fadeIn();
                $('form [type="submit"]').button('reset'); //Reset the button
                if (xhr.status == 404) {
                    //User does not exist
                    $('.input-group:has("#username")')
                        .addClass('has-error');
                } else if (xhr.status == 403) {
                    //Password incorrect
                    $('.input-group:has("#password")')
                        .addClass('has-error');
                }
            }
        );
    }
});