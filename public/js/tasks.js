$('document').ready(function () {
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


    $('#tasks-norway').click(function () {
        console.log("norsk");
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
    });

    $('#tasks-england').click(function () {
        console.log("english");
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
    });
});