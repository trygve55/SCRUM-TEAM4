/**
 * Created by Eline on 22.01.2018.
 */
$(document).ready(function () {


    $('#resetbutton').click(function () {
        $.ajax({
            url: '/api/user/forgottenPasswordReset',
            method: 'POST',
            data: {
                new_password: '',
                token: ''
            },
            success: function (data){
                console.log(data)
            },
            error: console.error
        });
    })
});