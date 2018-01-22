/**
 * Created by Eline on 15.01.2018.
 */
$('document').ready(function () {
    $('#passwordbutton').click(function () {
        $.ajax({

            url: '/api/user/forgottenPasswordReset',
            method: 'POST',
            data: {
                email: ''
            },
            success: function (data){
                console.log(data)
            },
            error: console.error
        });
    });
});