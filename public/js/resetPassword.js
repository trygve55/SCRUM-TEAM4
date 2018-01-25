/**
 * Created by Eline on 22.01.2018.
 */

var lang;

$('document').ready(function () {
    //$("#success-alert").hide();
    //$("#warning-alert").hide();



    $.ajax({
        url: '/api/language',
        method: 'GET',
        data: {
            lang: 'nb_NO',
            path: window.location.pathname
        },
        success: function (data) {
            lang = data;
            for (var p in data) {
                if (data.hasOwnProperty(p)) {
                    $("#" + p).html(data[p]);
                }
            }

            $("#rp-new").attr("placeholder", data["rp-new"]);
            $("#rp-repeat").attr("placeholder", data["rp-repeat"]);
        }
    });

    $('#profile-norway').click(function () {
        $.ajax({
            url: '/api/language',
            method: 'POST',
            data: {
                lang: 'nb_NO'
            },
            success: function () {
                $.ajax({
                    url: '/api/language',
                    method: 'GET',
                    data: {
                        lang: 'nb_NO',
                        path: window.location.pathname
                    },
                    success: function (data) {
                        lang = data;
                        for (var p in data) {
                            if (data.hasOwnProperty(p)) {
                                $("#" + p).html(data[p]);
                            }
                        }
                        $("#rp-new").attr("placeholder", data["rp-new"]);
                        $("#rp-repeat").attr("placeholder", data["rp-repeat"]);
                    }
                });
            },
            error: console.error
        });

    });

    $('#profile-england').click(function () {
        $.ajax({
            url: '/api/language',
            method: 'POST',
            data: {
                lang: 'en_US'
            },
            success: function () {
                $.ajax({
                    url: '/api/language',
                    method: 'GET',
                    data: {
                        lang: 'en_US',
                        path: window.location.pathname
                    },
                    success: function (data) {
                        lang = data;
                        for (var p in data) {
                            if (data.hasOwnProperty(p)) {
                                $("#" + p).html(data[p]);
                            }
                        }

                        $("#rp-new").attr("placeholder", data["rp-new"]);
                        $("#rp-repeat").attr("placeholder", data["rp-repeat"]);
                    }
                });
            },
            error: console.error
        });
    });

    $("#rp-new").focusout(function (){
        if($(this).val() === "") {
            $("#rp-error").hide();
            $("#rp-new").css({
                "border": "1px solid #ced4da",
                "background": "white"
            });
            $("#rp-repeat").css({
                "border": "1px solid #ced4da",
                "background": "white"
            });
        }
        else if($(this).val() !== $("#rp-repeat").val() && $("#rp-repeat").val() !== ""){
            $("#rp-error").show();
            $('#rp-new').css({
                "border": "1px solid red",
                "background": "#FFCECE"
            });
            $("#rp-repeat").css({
                "border": "1px solid red",
                "background": "#FFCECE"
            });
        }
        else {
            $("#rp-error").hide();
            $("#rp-new").css({
                "border": "1px solid #ced4da",
                "background": "white"
            });
            $("#rp-repeat").css({
                "border": "1px solid #ced4da",
                "background": "white"
            });
        }
    });


    $("#rp-repeat").focusout(function (){
        if($(this).val() === "") {
            $("#rp-error").hide();
            $("#rp-new").css({
                "border": "1px solid #ced4da",
                "background": "white"
            });
            $("#rp-repeat").css({
                "border": "1px solid #ced4da",
                "background": "white"
            });
        }
        else if($(this).val() !== $("#rp-new").val()){
            $("#rp-error").show();
            $('#rp-new').css({
                "border": "1px solid red",
                "background": "#FFCECE"
            });
            $("#rp-repeat").css({
                "border": "1px solid red",
                "background": "#FFCECE"
            });
        }
        else {
            $("#rp-error").hide();
            $("#rp-new").css({
                "border": "1px solid #ced4da",
                "background": "white"
            });
            $("#rp-repeat").css({
                "border": "1px solid #ced4da",
                "background": "white"
            });
        }
    });

    $('#rp-save').click(function () {
        if($('#rp-repeat').val() == $("#rp-new").val()) {
            $.ajax({
                url: '/api/user/forgottenPasswordReset',
                method: 'POST',
                data: {
                    new_password: $('#rp-repeat').val(),
                    token: window.location.search.split("=")[1].split("&")[0]
                },
                success: function (data) {
                    console.log(data);
                },
                error: console.error
            });
        }
/*
            window.location.href = "login.html";
            $("#success-alert").show();

        }else{
            $("#warning-alert").show();
            setTimeout(function () {
                $("#warning-alert").alert('close');
            }, 2000);
        }
        */
    });

    $('#rp-repeat').keypress(function (e) {
        if(e.keyCode!=13||e.which!=13 && $('#rp-repeat').val() != $("#rp-new").val()) {
            return;
        }else{
            if($('#rp-repeat').val() == $("#rp-new").val())
                $.ajax({
                    url: '/api/user/forgottenPasswordReset',
                    method: 'POST',
                    data: {
                        new_password: $('#rp-repeat').val(),
                        token: window.location.search.split("=")[1].split("&")[0]
                    },
                    success: function (data) {
                        console.log(data);
                    },
                    error: console.error
                });
        }
    });





});