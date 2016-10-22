$(function () {
    /* Events */

    //Handle when user presses enter
    $('.input').keypress(function (e) {
        if (e.which == 13) {
            $('#register_form').submit();
        }
    });

    //Handle click on submit button
    $('#register_form').submit(register);

    //Handle whenever there is a change in the form input
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
        var confirmation = $('#confirmation').val(); //Confirmation password

        //Pre-conditions
        if (password != confirmation) { //Password does not match
            $('form .alert')
                .html('Passwords does not match')
                .addClass('alert-danger')
                .fadeIn();

            $('.input-group:has(#password)')
                .addClass('has-error');

            $('.input-group:has(#confirmation)')
                .addClass('has-error');
            return;
        }

        if (password.length < 6) { //Password is too short
            $('form .alert')
                .html('Password should be at least 6 characters')
                .addClass('alert-danger')
                .fadeIn();

            $('.input-group:has(#password)')
                .addClass('has-error');
            return;
        }

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
        }).done(function () { //Successfully created account
            $('form .alert')
                .html('Successful')
                .addClass('alert-success')
                .fadeIn(400, function () {
                    $('.panel')
                        .fadeOut(200, function () { //Fade out the panel
                            window.location.href = "index.html"; //Redirect to home
                        });
                });
        }).fail(function (xhr) {
            $('form .alert')
                .html(xhr.responseJSON.message)
                .addClass('alert-danger')
                .fadeIn();

            if (xhr.status == 409) { //User already exists
                $('.input-group:has(#username)')
                    .addClass('has-error');
            }
        });

    }
});