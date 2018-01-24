var recipeList;

$(function () {
    /**
     * This method retrieves all recipes saved on the database, and places them on the
     * side div.
     */
    $.ajax({
        url: '/template',
        method: 'GET',
        data: {
            files: [
                'recipeList.html',
            ]
        },
        success: function (data){
            recipeList = Handlebars.compile(data['recipeList.html']);
        }
    });

    /**
     * This method creates the standard calender.
     */
    $('#calendar').fullCalendar({
        height: 630,
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay,listWeek'
        },
        defaultDate: '2017-12-12',
        navLinks: true, // can click day/week names to navigate views
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        events: [
            {
                title: 'All Day Event',
                start: '2017-12-01',
            }
        ]
    });

    /**
     * This method retrieves all recipes saved in the database.
     */
    $.ajax({
        url: '/api/meal/',
        method: 'GET',
        success: function (data) {
            $('.recipelist').html("");
            for(var i = 0; i < data.length; i++){
                $('.recipelist').append(recipeList({
                    entry_id: '',
                    entry_text: ''
                }));
            }
        }
    })

    /**
     * This method calls the language api and sets the standard language as
     * norwegian.
     */
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
            $("#meal-filter").attr("placeholder", data["meal-filter"]);
        }
    });

    /**
     * This method calls the language api and sets the language to norwegian
     * if the user clicks on the norwegian flag.
     */
    $('#meal-norway').click(function () {
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
                        for (var p in data) {
                            if (data.hasOwnProperty(p)) {
                                $("#" + p).html(data[p]);
                            }
                        }
                        $("#meal-filter").attr("placeholder", data["meal-filter"]);
                    }
                });
            },
            error: console.error
        });

    });

    /**
     * This method calls the language api and sets the language to english
     * if the user clicks on the british flag.
     */
    $('#meal-england').click(function () {
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
                        for (var p in data) {
                            if (data.hasOwnProperty(p)) {
                                $("#" + p).html(data[p]);
                            }
                        }
                        $("#meal-filter").attr("placeholder", data["meal-filter"]);
                    }
                });
            },
            error: console.error
        });

    });

});

/**
 * This function
 */
function addRecipe() {

}