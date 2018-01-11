/**
 * Created by odasteinlandskaug on 10.01.2018.
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
            document.getElementById('status').innerHTML = 'We are connected';
            document.getElementById('login').style.visibility = 'hidden';
            window.top.location = "http://localhost:8000/index.html";

        } else if(response.status === 'not_authorized'){
            document.getElementById('status').innerHTML = 'We are not logged in';

        } else{
            document.getElementById('status').innerHTML = 'You are not logged in to facebook'

        }
    });

    FB.Event.subscribe('auth.login', function () {
        location.reload();
        console.log('test');
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
        if(response.status === 'connected'){
            document.getElementById('status').innerHTML = 'We are connected';
            document.getElementById('login').style.visibility = 'hidden';
            console.log('1');
        } else if(response.status === 'not_authorized'){
            document.getElementById('status').innerHTML = 'We are not logged in';
            console.log('2');
        } else{
            document.getElementById('status').innerHTML = 'You are not logged in to facebook'
            console.log('3');
        }
    }, {scope: 'email'});

}

function getInfo(){
    FB.api('/me', 'GET', {fields: 'first_name,last_name,name,id,email'}, function(response) {
        document.getElementById('status').innerHTML = response.id;
    });
    FB.api('/me', 'GET', {
        fields: 'first_name,last_name,name,id,email'
    }, function(response) {
        document.getElementById('status2').innerHTML = response.name;
    });
    FB.api('/me', 'GET', {
        fields: 'first_name,last_name,name,id,email'
    }, function(response) {
        document.getElementById('status').innerHTML = response.email;
    });
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