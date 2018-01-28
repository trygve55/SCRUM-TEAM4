$(document).ready(function() {
    /**
     * This method calls the language api and sets the standard language as
     * norwegian.
     */
    $.ajax({
        url: '../api/language/Landing',
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
        },
        error: console.error
    });

    /**
     * This method calls the language api and sets the language to norwegian
     * if the user clicks on the norwegian flag.
     */
    $('#landing-norway').click(function () {
        $.ajax({
            url: '/api/language/Landing',
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
                        generalLabels = [data["shop-new-label"], data["label-party"], data["label-food"], data["label-clean"], data["label-repairs"]];

                    }
                });
            }
        });
    });
});

/**
 * This method calls the language api and sets the language to english
 * if the user clicks on the british flag.
 */
$('#landing-england').click(function () {
    $.ajax({
        url: '/api/language/Landing',
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
                    generalLabels = [data["shop-new-label"], data["label-party"], data["label-food"], data["label-clean"], data["label-repairs"]];
                }
            });
        }
    });
});