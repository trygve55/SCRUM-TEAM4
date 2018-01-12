/**
 * Created by odasteinlandskaug on 10.01.2018.
 */
var connected = false;
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
                url: '/api/login',
                method: "GET",
                success: function(data){
                    if(data.login)
                        window.top.location = "http://localhost:8000/index.html";
                },
                error: console.error
            });
        }
    });

    FB.Event.subscribe('auth.statusChange', function (res) {
        console.log("hei");
        if(res.status === "connected") {
            FB.api('/me', 'GET', {fields: 'first_name,last_name,id,email'}, function (response) {
                console.log(response);
                $.ajax({
                    url: '/api/login/facebook',
                    method: 'POST',
                    data: {
                        facebook_api_id: response.id,
                        email: response.email,
                        forename: response.first_name,
                        lastname: response.last_name
                    },
                    success: function (data) {
                        window.top.location = "http://localhost:8000/index.html";
                    },
                    error: console.error
                });
            });
        }
    });
};


(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function login() {
    FB.login(function (response) {
        if (response.status === 'connected') {
        } else if (response.status === 'not_authorized') {

        }
    }, {scope: 'email'});
}

$(function () {
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

    $('#login-norway').click(function () {
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
    });

    $('#login-england').click(function () {
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
    });
});