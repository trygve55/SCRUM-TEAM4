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
            for (var p in data) {
                if (data.hasOwnProperty(p)) {
                    $("#" + p).html(data[p]);
                }
            }
        }
    });

    $('#index-norway').click(function () {
        $.ajax({
            url: '/api/language',
            method: 'POST',
            data: {
                lang: 'nb_NO'
            },
            success: function (data) {
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
                    }
                });
            }
        });
    });

    $('#index-england').click(function () {
        $.ajax({
            url: '/api/language',
            method: 'POST',
            data: {
                lang: 'en_US'
            },
            success: function (data) {
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
                    }
                });
            }
        });
    });

    $('#index-logoutNavbar').click(function () {
        $.ajax({
            url: '/api/login/logout',
            method: 'POST',
            success: function (data) {
                if(!data.login){
                    window.top.location="http://localhost:8000/login.html";
                }
            }
        })

    })


    $.ajax({
        url:'/api/user/getUser',
        method:'GET',
        data: {
            variables: [
                'forename',
                'lastname'
            ]
        },
        success: function (data) {
            $('#index-username').text(data[0].forename + ' ' + data[0].lastname);
        },
        error: console.error



    })

});