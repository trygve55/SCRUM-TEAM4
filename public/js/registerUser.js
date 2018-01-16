/**
 * Created by odasteinlandskaug on 10.01.2018.
 */
$(function () {
    $.ajax({
        url: '/api/language',
        method: 'GET',
        data: {
            lang: 'nb_NO',
            path: window.location.pathname
        },
        success: function (data) {
            for(var p in data){
                if(data.hasOwnProperty(p)){
                    $("#" + p).html(data[p]);
                }
            }
            $("#register-username").attr("placeholder", data["register-username"]);
            $("#register-password").attr("placeholder", data["register-password"]);
            $("#register-repeatpassword").attr("placeholder", data["register-repeatpassword"]);
            $("#register-firstname").attr("placeholder", data["register-firstname"]);
            $("#register-lastname").attr("placeholder", data["register-lastname"]);
            $("#register-email").attr("placeholder", data["register-email"]);
            $("#register-phone").attr("placeholder", data["register-phone"]);
        }

    });
    $('#register-norway').click(function () {
        $.ajax({
            url: '/api/language',
            method: "POST",
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

                        for(var p in data){
                            if(data.hasOwnProperty(p)){
                                $("#" + p).html(data[p]);
                            }
                        }
                        $("#register-username").attr("placeholder", data["register-username"]);
                        $("#register-password").attr("placeholder", data["register-password"]);
                        $("#register-repeatpassword").attr("placeholder", data["register-repeatpassword"]);
                        $("#register-firstname").attr("placeholder", data["register-firstname"]);
                        $("#register-lastname").attr("placeholder", data["register-lastname"]);
                        $("#register-email").attr("placeholder", data["register-email"]);
                        $("#register-phone").attr("placeholder", data["register-phone"]);
                    }
                });
            },
            error: console.error
        });
    });

    $('#register-england').click(function () {
        $.ajax({
            url: '/api/language',
            method: "POST",
            data: {
                lang: "en_US"
            },
            success: function (){
                $.ajax({
                    url: '/api/language',
                    method: 'GET',
                    success: function (data) {

                        for(var p in data){
                            if(data.hasOwnProperty(p)){
                                $("#" + p).html(data[p]);
                            }
                        }
                        $("#register-username").attr("placeholder", data["register-username"]);
                        $("#register-password").attr("placeholder", data["register-password"]);
                        $("#register-repeatpassword").attr("placeholder", data["register-repeatpassword"]);
                        $("#register-firstname").attr("placeholder", data["register-firstname"]);
                        $("#register-lastname").attr("placeholder", data["register-lastname"]);
                        $("#register-email").attr("placeholder", data["register-email"]);
                        $("#register-phone").attr("placeholder", data["register-phone"]);
                    }
                });
            },
            error: console.error
        });
    });

    $("#register-password").focusout(function (){
        if($(this).val() === "") {
            $("#register-password-error").hide();
            $("#register-password").css({
                "border": "1px solid #ced4da",
                "background": "white"
            });
            $("#register-repeatpassword").css({
                "border": "1px solid #ced4da",
                "background": "white"
            });
        }
        else if($(this).val() !== $("#register-repeatpassword").val() && $("#register-repeatpassword").val() !== ""){
            $("#register-password-error").show();
            $('#register-password').css({
                "border": "1px solid red",
                "background": "#FFCECE"
            });
            $("#register-repeatpassword").css({
                "border": "1px solid red",
                "background": "#FFCECE"
            });
        }
        else {
            $("#register-password-error").hide();
            $("#register-password").css({
                "border": "1px solid #ced4da",
                "background": "white"
            });
            $("#register-repeatpassword").css({
                "border": "1px solid #ced4da",
                "background": "white"
            });
        }
    });

    $("#register-repeatpassword").focusout(function (){
        if($(this).val() === "") {
            $("#register-password-error").hide();
            $("#register-password").css({
                "border": "1px solid #ced4da",
                "background": "white"
            });
            $("#register-repeatpassword").css({
                "border": "1px solid #ced4da",
                "background": "white"
            });
        }
        else if($(this).val() !== $("#register-password").val()){
            $("#register-password-error").show();
            $('#register-password').css({
                "border": "1px solid red",
                "background": "#FFCECE"
            });
            $("#register-repeatpassword").css({
                "border": "1px solid red",
                "background": "#FFCECE"
            });
        }
        else {
            $("#register-password-error").hide();
            $("#register-password").css({
                "border": "1px solid #ced4da",
                "background": "white"
            });
            $("#register-repeatpassword").css({
                "border": "1px solid #ced4da",
                "background": "white"
            });
        }
    });

    $("#register-username").focusout(function(){
        if($(this).val() === "") {
            $("#register-username-error").hide();
            $("#register-username").css({
                "border": "1px solid #ced4da",
                "background": "white"
            });
            return;
        }
        $.ajax({
            url: '/api/user/user',
            method: 'GET',
            data: {
                username: $(this).val()
            },
            success: function (){
                $("#register-username-error").hide();
                $("#register-username").css({
                    "border": "1px solid #ced4da",
                    "background": "white"
                });
            },
            error: function (){

                $('#register-username').css({
                    "border": "1px solid red",
                    "background": "#FFCECE"
                });
                $("#register-username-error").show();
            }
        });
    });

    $("#register-email").focusout(function(){
        if($(this).val() == "") {
            $("#register-email-error").hide();
            $("#register-email").css({
                "border": "1px solid #ced4da",
                "background": "white"
            });
            return;
        }
        $.ajax({
            url: '/api/user/mail',
            method: 'GET',
            data: {
                email: $(this).val()
            },
            success: function (){
                $("#register-email-error").hide();
                $("#register-email").css({
                    "border": "1px solid #ced4da",
                    "background": "white"
                });
            },
            error: function (){
                $('#register-email').css({
                    "border": "1px solid red",
                    "background": "#FFCECE"
                });
                $("#register-email-error").show();
            }
        });
    });

    $('#register-done').click(function (e) {
        e.preventDefault();
        var isValid = true;
        if( $('#register-username').val() === ""){
            isValid = false;
            $('#register-username').css({
                "border": "1px solid red",
                "background": "#FFCECE"
            });
        }
        if( $('#register-password').val() === ""){
            isValid = false;
            $('#register-password').css({
                "border": "1px solid red",
                "background": "#FFCECE"
            });
        }
        if( $('#register-repeatpassword').val() === ""){
            isValid = false;
            $('#register-repeatpassword').css({
                "border": "1px solid red",
                "background": "#FFCECE"
            });
        }
        if( $('#register-firstname').val() === ""){
            isValid = false;
            $('#register-firstname').css({
                "border": "1px solid red",
                "background": "#FFCECE"
            });
        }
        if( $('#register-lastname').val() === ""){
            isValid = false;
            $('#register-lastname').css({
                "border": "1px solid red",
                "background": "#FFCECE"
            });
        }
        if( $('#register-email').val() === ""){
            isValid = false;
            $('#register-email').css({
                "border": "1px solid red",
                "background": "#FFCECE"
            });
        }

        if(isValid){
            $.ajax({
                url: '/api/user/register',
                method: 'POST',
                data:{
                    email: $('#register-email').val(),
                    username: $('#register-username').val(),
                    password: $('#register-password').val(),
                    forename: $('#register-firstname').val(),
                    lastname: $('#register-lastname').val(),
                    phone: $('#register-phone').val()
                },
                success: function (data) {
                    window.location='/index.html';
                },
                error: console.error
            })
        }
    });
});




