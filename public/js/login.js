var connected = false;

/**
 * This function checks whether the person is logged on facebook or not. If the person is connected
 * it will retrieve the info about the person stored in the database.
 */
window.fbAsyncInit = function() {
    FB.init({
        appId            : '548372472188099',
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v2.11'
    });

    FB.getLoginStatus(function (response) {
        if(response.status === 'connected'){
            connected = true;
            $.ajax({
                url: '/api/auth',
                method: "GET",
                success: function(data){
                    if(data.login) {

                        window.location = "/index.html";
                    }
                },
                error: console.error
            });
        }
    });
};

/**
 * This function
 */
(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

/**
 * This is the login to facebook function. It checks if the person is connected
 * and if the person has authorized us to retrieve their information. If everything
 * is ok, the person will be able to log in using facebook, and this method will
 * store information about the person in the database if it's the first they log in
 * using facebook.
 */
function login() {
    FB.login(function (response) {
        if (response.status === 'connected') {
            FB.getLoginStatus(function(response) {
                if (response.status === 'connected') {
                    console.log(response.authResponse);

                    $.ajax({
                        url: '/api/auth/facebook',
                        method: 'POST',
                        data: {
                            accessToken: response.authResponse.accessToken
                        },
                        success: function (data) {
                            console.log(data);

                            localStorage.person_id=data.person_id;
                            window.location = "/index.html";
                        },
                        error: console.error
                    });
                }
            } );

        } else if (response.status === 'not_authorized') {

        }
    }, {scope: 'email'});
}


$(function () {
    /**
     * This method calls the language api and sets the standard language as
     * norwegian.
     */
    $.ajax({
        url: '/api/language',
        method: 'GET',
        data: {
            lang: 'nb_NO',
            path: window.location.pathname
        },
        success: function (data) {
            for (var p in data) {
                if (data.hasOwnProperty(p)) {
                    $("#" + p).html(data[p]);
                }
            }
            $("#login-email").attr("placeholder", data["login-email"]);
            $("#login-password").attr("placeholder", data["login-password"]);
        }
    });

    /**
     * This method calls the language api and sets the language to norwegian
     * if the user clicks on the norwegian flag.
     */
    $('#login-norway').click(function () {
        $.ajax({
            url: '/api/language',
            method: 'POST',
            data: {
                lang: 'nb_NO'
            },
            success: function (){
                $.ajax({
                    url: '/api/language',
                    method: 'GET',
                    data: {
                        lang: 'nb_NO',
                        path: window.location.pathname
                    },
                    success: function (data) {
                        for (var p in data) {
                            if (data.hasOwnProperty(p)) {
                                $("#" + p).html(data[p]);
                            }
                        }
                        $("#login-email").attr("placeholder", data["login-email"]);
                        $("#login-password").attr("placeholder", data["login-password"]);
                    }
                });
            },
            error: console.error
        });

    });

    /**
     * This method calls the language api and sets the language to english
     * if the user clicks on the british flag.
     */
    $('#login-england').click(function () {
        $.ajax({
            url: '/api/language',
            method: 'POST',
            data: {
                lang: 'en_US'
            },
            success: function (){
                $.ajax({
                    url: '/api/language',
                    method: 'GET',
                    data: {
                        lang: 'en_US',
                        path: window.location.pathname
                    },
                    success: function (data) {
                        for (var p in data) {
                            if (data.hasOwnProperty(p)) {
                                $("#" + p).html(data[p]);
                            }
                        }
                        $("#login-email").attr("placeholder", data["login-email"]);
                        $("#login-password").attr("placeholder", data["login-password"]);
                    }
                });
            },
            error: console.error
        });

    });

    /**
     * This function makes it possible for a user to login if their user information, password
     * and username, is correckt, when pushing the login-button
     */
    $("#login-button").click(function () {
        $.ajax({
            url: '/api/auth',
            method: 'POST',
            data:{
                username: $('#login-email').val(),
                password: $('#login-password').val()
            },
            success: function (data) {
                console.log(data);
                if(data.login) {
                    localStorage.person_id=data.person_id;
                    window.location = '/index.html';
                }
            },
            error: function (data) {
                $("#login-email").css({
                    "border": "1px solid red",
                    "background": "#FFCECE"
                });
                $("#login-password").css({
                    "border": "1px solid red",
                    "background": "#FFCECE"
                });
                $("#wrong-password").show();
            }
        });
    });

    /**
     * This function makes it possible for a user to login, without pushing the login-button, but
     * by pressing enter.
     */
    $("#login-password").keypress(function(e){
        if(e.keyCode!=13||e.which!=13)
            return;
        $.ajax({
            url: '/api/auth',
            method: 'POST',
            data:{
                username: $('#login-email').val(),
                password: $('#login-password').val()
            },
            success: function (data) {
                console.log(data);
                if(data.login)
                    window.location = '/index.html';
            },
            error: function (data) {
                $("#login-email").css({
                    "border": "1px solid red",
                    "background": "#FFCECE"
                });
                $("#login-password").css({
                    "border": "1px solid red",
                    "background": "#FFCECE"
                });
                $("#ifwrong").show();
            }
        });
    })
});
