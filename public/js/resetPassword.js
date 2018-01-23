/**
 * Created by Eline on 22.01.2018.
 */

var lang;

$('document').ready(function () {

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

    $('#rp-save').click(function () {
        $.ajax({
            url: '/api/user/forgottenPasswordReset',
            method: 'POST',
            data: {
                new_password: $('#rp-repeat').val(),
                token: window.location.search.split("=")[1].split("&")[0]
            },
            success: function (data){
                console.log(data)
            },
            error: console.error
        });
    });




    $('#rp-repeat').keypress(function (e) {
        if(e.keyCode!=13||e.which!=13)
            return;
        $.ajax({
            url: '/api/user/forgottenPasswordReset',
            method: 'POST',
            data: {
                new_password: $('#rp-repeat').val(),
                token: window.location.search.split("=")[1].split("&")[0]
            },
            success: function (data){
                console.log(data)
            },
            error: console.error
        });
    });
});