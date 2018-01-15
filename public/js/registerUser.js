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
                        console.log(data);
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
                        console.log(data);
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



    $('#register-done').click(function (e) {
        var isValid = true;
        if( $('#register-username').val() === ""){
            isValid = false;
            $('#register-username').css({
                "border": "1px solid red",
                "background": "#FFCECE"
            })
        }
        if( $('#register-password').val() === ""){
            isValid = false;
            $('#register-password').css({
                "border": "1px solid red",
                "background": "#FFCECE"
            })
        }
        if( $('#register-repeatpassword').val() === ""){
            isValid = false;
            $('#register-repeatpassword').css({
                "border": "1px solid red",
                "background": "#FFCECE"
            })
        }
        if( $('#register-firstname').val() === ""){
            isValid = false;
            $('#register-firstname').css({
                "border": "1px solid red",
                "background": "#FFCECE"
            })
        }
        if( $('#register-lastname').val() === ""){
            isValid = false;
            $('#register-lastname').css({
                "border": "1px solid red",
                "background": "#FFCECE"
            })
        }
        if( $('#register-email').val() === ""){
            isValid = false;
            $('#register-email').css({
                "border": "1px solid red",
                "background": "#FFCECE"
            })
        }

        if(isValid == false){
            e.preventDefault();

        } else {
            alert("Working");
        }

    })

});




