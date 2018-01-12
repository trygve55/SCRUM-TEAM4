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
<<<<<<< HEAD
            document.getElementById('status').innerHTML = '';
=======
            document.getElementById('status').innerHTML = '1';
>>>>>>> e52935f93e309431b6a12152eef689932a24dbed
            document.getElementById('login').style.visibility = 'hidden';
            $.ajax({
                url: '/api/login',
                method: "GET",
                success: function(data){
                    if(data.login)
                        window.top.location = "http://localhost:8000/index.html";
                },
                error: console.error
            });

        } else if(response.status === 'not_authorized'){
            document.getElementById('status').innerHTML = '2';

        } else{
<<<<<<< HEAD
            document.getElementById('status').innerHTML = '';
=======
            document.getElementById('status').innerHTML = '3';
>>>>>>> e52935f93e309431b6a12152eef689932a24dbed
        }
    });

    FB.Event.subscribe('auth.login', function () {
        //location.reload();
<<<<<<< HEAD
        FB.api('/me', 'GET', {fields: 'first_name,last_name,id,email'}, function (response) {
=======
        FB.api('/me', 'GET', {fields: 'first_name,last_name,name,id,email'}, function (response) {
>>>>>>> e52935f93e309431b6a12152eef689932a24dbed
            console.log(response);
            $.ajax({
                url: '/api/login/facebook',
                method: 'POST',
                data: {
<<<<<<< HEAD
                    facebook_api_id: response.id,
                    email: response.email,
                    forename: response.first_name,
                    lastname: response.last_name
                },
                success: function (data) {
                    window.top.location = "http://localhost:8000/index.html";
=======
                    facebook_api_id: response.id
                },
                success: function (data) {
                    alert("yiughk");
>>>>>>> e52935f93e309431b6a12152eef689932a24dbed
                },
                error: console.error
            });
        });
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
    console.log("ee");
    if(connected) {
        console.log("e");

    }
    else {
        FB.login(function (response) {
            if (response.status === 'connected') {
                document.getElementById('status').innerHTML = '';
                document.getElementById('login').style.visibility = 'hidden';
                console.log('1');
            } else if (response.status === 'not_authorized') {
                document.getElementById('status').innerHTML = '';
                console.log('2');
            } else {
                document.getElementById('status').innerHTML = 'kkk';
                console.log('3');
            }
        }, {scope: 'email'});
    }
}

function logout(){
    FB.logout(function(response){
        alert('You are now logged out');
        console.log("Response goes here!");
    })
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