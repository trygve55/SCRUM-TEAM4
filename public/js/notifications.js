var socket = io();
var notifications = [];
var notItem, notItemAD;
var langNotification;


socket.emit('setup', {
    person_id: Cookies.get('person_id')
});

socket.on('invite group', function(data){
    notifications.push({
        type: 0,
        data: data
    });
});

$(function(){
    /**
     * This method calls the language api and sets the standard language as
     * norwegian.
     */
    $.ajax({
        url: '/api/language',
        method: 'GET',
        data: {
            lang: 'nb_NO',
            path: '/notifications.html'
        },
        success: function (data) {
            langNotification = data;
        }
    });

    /**
     * This method calls the language api and sets the language to norwegian
     * if the user clicks on the norwegian flag.
     */
    $('#login-norway').click(function () {
        $.ajax({
            url: '/api/language',
            method: 'POST',
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
                        for (var p in data) {
                            if (data.hasOwnProperty(p)) {
                                $("#" + p).html(data[p]);
                            }
                        }
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
    $('#login-england').click(function () {
        $.ajax({
            url: '/api/language',
            method: 'POST',
            data: {
                lang: 'en_US'
            },
            success: function (){
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
            },
            error: console.error
        });
    });

    if(window.innerWidth > 991)
        $(".navbar-nav.ml-auto").prepend("<i style='margin-top: 10px; margin-right: 15px' id='notification-center' class='fa fa-bell' aria-hidden='true'></i>");
    else
        $("button[data-target='#navbarNavAltMarkup']").parent().prepend("<i style='margin-top: 10px; margin-right: 15px' id='notification-center' class='fa fa-bell' aria-hidden='true'></i>");
    $.ajax({
        url: '/template',
        method: 'GET',
        data: {
            files: ['notificationItem.html', 'notificationItemAD.html']
        },
        success: function(data){
            notItem = Handlebars.compile(data['notificationItem.html']);
            notItemAD = Handlebars.compile(data['notificationItemAD.html']);
            $.ajax({
                url: '/api/notify',
                method: 'GET',
                success: function(data){
                    for(var i = 0; i < data.length; i++) {
                        notifications = notifications.concat(data[i]);
                    }
                    notificationColor();

                    $("#notification-center").click(function(){
                        if($("#popup").length > 0)
                            return $("#popup").remove();
                        $("body").append("<div id=\"popup\" align='center' style='background-color: white; max-height: 320px; width: 300px'></div>");
                        var h = "<ul class=\"list-group itemlist\">";
                        for(var i = 0; i < notifications.length; i++){
                            if(notifications[i].group_id){
                                h += notItemAD({
                                    text: langNotification["n-group-invite"] + notifications[i].group_name,
                                    data: "data-group='" + notifications[i].group_id + "'",
                                    n_accept: '',
                                    n_decline: ''
                                });
                            }
                            else if(notifications[i].person_id){
                                h += notItem({
                                    text: langNotification["n-unfinished-task"] + notifications[i].todo_text,
                                    data: "data-todo='" + notifications[i].todo_id + "'",
                                    n_accept: '',
                                    n_decline: ''
                                });
                            }
                            else if(notifications[i].shopping_list_id){
                                h += notItemAD({
                                    text: langNotification["n-shoppinglist-invite"] + notifications[i].shopping_list_name,
                                    data: "data-slist='" + notifications[i].shopping_list_id + "'",
                                    n_accept: '',
                                    n_decline: ''
                                });
                            }
                        }
                        if(notifications.length == 0){
                            h += notItem({
                                text: langNotification["n-no-notifications"]
                            });
                        }

                        $("#popup").html(h + "</ul>");
                        $("#popup").css({
                            'position': 'absolute',
                            'left': (window.innerWidth > 991 ? $("#notification-center").offset().left - ($("#popup").width() / 2) + ($("#notification-center").width() / 2) : 0),
                            'top': $("#notification-center").offset().top + $("#notification-center").height() + 5,
                            border: 'red'
                        }).show();

                        $(".fa-check").click(function(){
                            var li = $(this).closest("li");
                            var group_id = $(li).data("group");
                            var list_id = $(li).data("slist");
                            if(group_id){
                                $.ajax({
                                    url: '/api/group/' + group_id + '/invite',
                                    method: 'POST',
                                    success: function(){
                                        for(var i = 0; i < notifications.length; i++){
                                            if(notifications[i].group_id == group_id) {
                                                notifications.splice(i, 1);
                                                notificationColor();
                                            }
                                        }
                                        $(li).closest("li").html(langNotification["n-accept-inv"]);
                                    },
                                    error: console.error
                                });
                            }
                            else if(list_id){
                                $.ajax({
                                    url: '/api/shoppingList/info/' + list_id,
                                    method: 'PUT',
                                    data: {
                                        invite_accepted: true
                                    },
                                    success: function(){
                                        for(var i = 0; i < notifications.length; i++){
                                            if(notifications[i].group_id == group_id) {
                                                notifications.splice(i, 1);
                                                notificationColor();
                                            }
                                        }
                                        $(li).closest("li").html(langNotification["n-accept-inv"]);
                                    },
                                    error: console.error
                                });
                            }
                        });

                        $(".fa-times").click(function(){
                            var li = $(this).closest("li");
                            var group_id = $(li).data("group");
                            var list_id = $(li).data("slist");
                            if(group_id){
                                $.ajax({
                                    url: '/api/group/' + group_id + '/invite',
                                    method: 'DELETE',
                                    success: function(){
                                        for(var i = 0; i < notifications.length; i++){
                                            if(notifications[i].group_id == group_id) {
                                                notifications.splice(i, 1);
                                                notificationColor();
                                            }
                                        }
                                        $(li).closest("li").html(langNotification["n-decline-inv"]);
                                    },
                                    error: console.error
                                });
                            }
                            else if(list_id){
                                $.ajax({
                                    url: '/api/shoppingList/info/' + list_id,
                                    method: 'PUT',
                                    data: {
                                        is_hidden: true
                                    },
                                    success: function(){
                                        for(var i = 0; i < notifications.length; i++){
                                            if(notifications[i].shopping_list_id == list_id) {
                                                notifications.splice(i, 1);
                                                notificationColor();
                                            }
                                        }
                                        $(li).closest("li").html(langNotification["n-decline-inv"]);
                                    },
                                    error: console.error
                                });
                            }
                        });
                    });

                    $("body").click(function(e){
                        if(e.target.id != "notification-center" && e.target.id != "popup" && $(e.target).closest("#popup").length == 0 && $("#popup").length > 0)
                            $("#popup").remove();
                    });
                },
                error: console.error
            });
        }
    });
});

/**
 * Method that changes color of notification bell depending on if the user has any notifications.
 */
function notificationColor() {
    if(notifications.length != 0){
        $("#notification-center").css("color", "red");
    }
    else{
        $("#notification-center").css("color", "black");
    }
}