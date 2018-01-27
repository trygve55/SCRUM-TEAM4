/**
 * Created by Eline on 22.01.2018.
 */

var lang;

$('document').ready(function () {
    $('#rp-error').hide();
    $('#rp-success').hide();

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

    /**
     * Method for saving new password when clicking the save password button.
     */
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
                    $('#rp-error').hide();
                    $('#rp-success').show();
                    console.log(data);
                },
                error: function () {
                    $('#rp-error').hide();
                    $('#rp-success').show();
                    $('#rp-new').hide();
                    $('#rp-repeat').hide();
                    $('#rp-save').hide();
                    setTimeout(function(){location.href="login.html"} , 3000);
                    window.location.href="login.html";
                }
            });
        }else{
            $('#rp-error').show();
        }
    });

    /**
     * Method for saving new password when pressing enter.
     */
    $('#rp-repeat').keypress(function (e) {
        if(e.keyCode!=13||e.which!=13 && $('#rp-repeat').val() != $("#rp-new").val()) {
            return;
        }else{
            if($('#rp-repeat').val() == $("#rp-new").val()) {
                $.ajax({
                    url: '/api/user/forgottenPasswordReset',
                    method: 'POST',
                    data: {
                        new_password: $('#rp-repeat').val(),
                        token: window.location.search.split("=")[1].split("&")[0]
                    },
                    success: function (data) {
                        $('#rp-error').hide();
                        $('#rp-success').show();
                        $('#rp-new').hide();
                        $('#rp-repeat').hide();
                        $('#rp-save').hide();
                        setTimeout(function(){location.href="login.html"} , 3000);
                        console.log(data);
                    },
                    error: function () {
                        console.error
                    }
                });
            } else{
            $('#rp-error').show();
            }
        }
    });
});