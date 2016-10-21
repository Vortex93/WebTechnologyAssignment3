$(function () {
    "use strict";

    //todo remove the code below
    //For testing purposes
    $('#firstName').val('Derwin');
    $('#middleName').val('Edson');
    $('#lastName').val('Tromp');
    $('#username').val('derwin');
    $('#password').val('password');


    /* Events */

    $('.input').keypress(function (e) {
        if (e.which == 13) {
            $('#register_form').submit();
        }
    });

    $('#register_form').submit(register);

    $('#cancel_button').click(function () {
        window.location.href = "index.html";
    });

    $('form input').change(function () {
        $('form .alert') //Hide the alert
            .removeClass('alert-danger alert-success')
            .fadeOut();

        $('.input-group') //Remove the red border on input
            .removeClass('has-error');

        $('form [type="submit"]').button('reset');
    });

    /* Functions */

    /**
     * Register procedure
     */
    function register(e) {
        e.preventDefault(); //Prevent the form from reloading page
        $('form [type="submit"]').button('loading'); //Show loading on register

        //Gather request data
        var firstName = $('#firstName').val();
        var middleName = $('#middleName').val();
        var lastName = $('#lastName').val();
        var username = $('#username').val();
        var password = $('#password').val();

        $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({
                firstName: firstName,
                middleName: middleName,
                lastName: lastName,
                username: username,
                password: password
            }),
            dataType: 'json',
            type: 'POST',
            url: '/api/users'
        }).done(function (data) {
            //Successfully created account
            $('form .alert')
                .html('Successful')
                .addClass('alert-success')
                .fadeIn();
        }).fail(function (xhr) {

            //todo implement

            $('form .alert')
                .html(xhr.responseJSON.message)
                .addClass('alert-danger')
                .fadeIn();

            debugger;

            if (xhr.status == 409) {
                //User already exists
                $('.input-group:has(#username)')
                    .addClass('has-error');
            }
        });

    }
});