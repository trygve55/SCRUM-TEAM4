var socket = io();
var notifications = [];
var notItem, notItemAD;

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
                    $("#notification-center").click(function(){
                        if($("#popup").length > 0)
                            return $("#popup").remove();
                        $("body").append("<div id=\"popup\" align='center' style='background-color: white; max-height: 320px; width: 300px'></div>");
                        var h = "<ul class=\"list-group itemlist\">";
                        for(var i = 0; i < notifications.length; i++){
                            if(notifications[i].group_id){
                                h += notItemAD({
                                    text: "You have been invited to the group: " + notifications[i].group_name,
                                    data: "data-group='" + notifications[i].group_id + "'"
                                });
                            }
                            else if(notifications[i].person_id){
                                h += notItem({
                                    text: "You have an unfinished task: " + notifications[i].todo_text,
                                    data: "data-todo='" + notifications[i].todo_id + "'"
                                });
                            }
                            else if(notifications[i].shopping_list_id){
                                h += notItemAD({
                                    text: "You have been invited to the shopping list: " + notifications[i].shopping_list_name,
                                    data: "data-slist='" + notifications[i].shopping_list_id + "'"
                                });
                            }
                        }
                        if(notifications.length == 0){
                            h += notItem({
                                text: "You have no notifications"
                            });
                        }
                        console.log(h);

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
                                            }
                                        }
                                        $(li).closest("li").html("Invitation accepted");
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
                                            }
                                        }
                                        $(li).closest("li").html("Invitation accepted");
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
                                            }
                                        }
                                        $(li).closest("li").html("Invitation declined");
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
                                            }
                                        }
                                        $(li).closest("li").html("Invitation declined");
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