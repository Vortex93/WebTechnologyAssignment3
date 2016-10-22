$(function () {

    getUsers();

    /* Functions */

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
                $('tbody').append(
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