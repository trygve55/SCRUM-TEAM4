var lang;
var itemcount = 0;
var tasklist, completedList, completedItem, taskItem, newListItem;

$('document').ready(function () {
    $.ajax({
        url: '/template',
        method: 'GET',
        data: {
            files: [
                "tasklist.html",
                "completedTasklist.html",
                "completedTask.html",
                "taskItem.html",
                "newListItem.html"
            ]
        },
        success: function(data){
            tasklist = Handlebars.compile(data["tasklist.html"]);
            completedList = Handlebars.compile(data["completedTasklist.html"]);
            completedItem = Handlebars.compile(data["completedTask.html"]);
            taskItem = Handlebars.compile(data["taskItem.html"]);
            newListItem = Handlebars.compile(data["newListItem.html"]);
            prep();
        }
    });


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
            lang=data;
            for (var p in data) {
                if (data.hasOwnProperty(p)) {
                    $("#" + p).html(data[p]);
                }
            }
        }
    });

    /**
     * This method calls the language api and sets the language to norwegian
     * if the user clicks on the norwegian flag.
     */
    $('#tasks-norway').click(function () {
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
                        lang=data;
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

    /**
     * This method calls the language api and sets the language to english
     * if the user clicks on the british flag.
     */
    $('#tasks-england').click(function () {
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
                        lang=data;
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
});

function prep(){
    $.ajax({
        url: '/api/tasks/private/',
        method: 'GET',
        success: function(data) {
            for(var j = 0; j < data.length; j++) {
                var d = data[j];
                var entries = "";
                for (var i = 0; i < d.private_todo_entries.length; i++) {
                    entries += taskItem({
                        todo_id: d.private_todo_entries[i].private_todo_entry_id,
                        todo_text: d.private_todo_entries[i].todo_text
                    });
                }
                if (!d.is_deactivated) {
                    $("#addlist").after(tasklist({
                        task_list_id: d.private_todo_list_id,
                        task_list_name: (d.private_todo_list_name == "" ? lang["task-default-name"] : d.private_todo_list_name),
                        task_list_entries: entries,
                        lang_add_item: lang["task-add-item"],
                        lang_done_items: lang["task-done-tasks"],
                        lang_delete: lang["task-delete"],
                        color_hex: (d.color_hex ? d.color_hex.toString(16) : "FFFFFF")
                    }));
                }
            }
            setupClicks();
        }
    });


    /**
     * This method makes it possible for the user to create a new list. All the information about
     * the list is then stored to the database.
     */
    $('#addlist').click(function () {
        $.ajax({
            url: '/api/tasks/private/',
            method: 'POST',
            data: {
                private_todo_list_name: lang["task-default-name"]
            },
            success: function(data) {
                $.ajax({
                    url: '/api/tasks/private/' + data.private_todo_list_id,
                    method: 'GET',
                    success: function(data) {
                        $("#addlist").after(tasklist({
                            task_list_id: data.private_todo_list_id,
                            task_list_name: data.private_todo_list_name,
                            task_list_entries:"",
                            lang_add_item: lang["task-add-item"],
                            lang_done_items: lang["task-done-tasks"],
                            lang_delete: lang["task-delete"],
                            color_hex: (data.color_hex ? data.color_hex.toString(16) : "FFFFFF")
                        }));
                        setupClicks();
                    }
                });
            }
        });
    });
}

function setupClicks(){
    $(".list-name").unbind("click").click(function() {
        console.log("halllo");
        var listId = $(this).closest("div[data-id]").data("id");
        var title = $(this).html();
        $(this).hide();
        var div = $(this).parent().children(".list-name-div");
        $(div).show();
        $(div).children(".list-name-input").val(title).focus();
    });

    $(".list-name-input").unbind("focusout").focusout(function(){
        var text = $(this).val();
        var id = $(this).closest("div[data-id]").data("id");
        var h4 = $(this).parent().parent().children(".list-name");
        $(h4).html(text);
        $(this).parent().hide();
        $(h4).show();
        $.ajax({
            url: '/api/tasks/private/entry/' + id,
            method: 'PUT',
            data: {
                private_list_name: text
            }
        });
    });

    $(".list-name-input").unbind("keypress").keypress(function(e){
        if(e.keyCode != 13 && e.which != 13)
            return;
        var text = $(this).val();
        var id = $(this).closest("div[data-id]").data("id");
        var h4 = $(this).parent().parent().children(".list-name");
        $(h4).html(text);
        $(this).parent().hide();
        $(h4).show();
        $.ajax({
            url: '/api/tasks/private/list/' + id,
            method: 'PUT',
            data: {
                shopping_list_name: text
            }
        });
    });

    $(".add-item").unbind("click").click(function(){
        console.log('denna');
        $(this).closest("div").children(".itemlist").append(newListItem());
        console.log(this);

        $("#new-list-item").keypress(function(e){
            if(e.keyCode != 13 && e.which != 13)
                return;
            var ul = $(this).closest("ul");
            var text = $(this).val();
            if(text != "") {
                var t = this;
                saveItemToDB($(this).closest("div[data-id]").data("id"), text, ul, function(){
                    $(t).closest("li").remove();
                    addNewItem(ul);
                    setupItemClicks();
                });
            }
            else {
                setupItemClicks();
                $(this).closest("li").remove();
            }
        }).focusout(function(){
            var ul = $(this).closest("ul");
            var text = $(this).val();
            if(text != "") {
                saveItemToDB($(this).closest("div[data-id]").data("id"), text, ul, function(){
                    setupItemClicks();
                });
            }
            $(this).closest("li").remove();
        }).focus();
    });

    $('.pink-select').unbind("click").click(function () {
        var ls = $(this).closest("div[data-id]");
        var id = $(ls).css('background-color', $(this).data('color')).data("id");
        $.ajax({
            url: '/api/tasks/private/list/' + id,
            method: 'PUT',
            data: {
                color_hex: parseInt(rgb2hex($(ls).css('background-color')).split("#")[1], 16)
            }
        });
    });

    $('.yellow-select').unbind("click").click(function () {
        var ls = $(this).closest("div[data-id]");
        var id = $(ls).css('background-color', $(this).data('color')).data("id");
        $.ajax({
            url: '/api/tasks/private/list/' + id,
            method: 'PUT',
            data: {
                color_hex: parseInt(rgb2hex($(ls).css('background-color')).split("#")[1], 16)
            }
        });
    });

    $('.green-select').unbind("click").click(function () {
        var ls = $(this).closest("div[data-id]");
        var id = $(ls).css('background-color', $(this).data('color')).data("id");
        $.ajax({
            url: '/api/tasks/private/list/' + id,
            method: 'PUT',
            data: {
                color_hex: parseInt(rgb2hex($(ls).css('background-color')).split("#")[1], 16)
            }
        });
    });

    $('.white-select').unbind("click").click(function () {
        var ls = $(this).closest("div[data-id]");
        var id = $(ls).css('background-color', $(this).data('color')).data("id");
        $.ajax({
            url: '/api/tasks/private/list/' + id,
            method: 'PUT',
            data: {
                color_hex: parseInt(rgb2hex($(ls).css('background-color')).split("#")[1], 16)
            }
        });
    });

    /**
     * This method deletes a list.
     */
    $(".fa-trash").unbind("click").click(function () {
        var listid = $(this).parent().attr("data-id");
        $(this).closest("div[data-id]").remove();
        $.ajax({
            url: '/api/tasks/private/list/' + listid,
            method: 'PUT',
            data: {
                "is_deactivated": true
            },
            error: console.error
        });
    });

    setupItemClicks();
}

function setupItemClicks(){
    $(".fa-times").unbind("click").click(function(){
        var entry_id = $(this).closest("li[data-id]").data("id");
        $.ajax({
            url: '/api/tasks/private/entry/' + entry_id,
            method: 'DELETE',
            error: console.error
        });
        $(this).closest("li[data-id]").remove();
    });

    $(".datepicker").datepicker({
        //dateFormat: 'DD, mm-y'
        dateFormat: 'dd/mm/y',
        onSelect: function() {
            var d = $(this).val();
            if(d != ""){
                d = d.split("/");
                d = d[2] + "-" + d[1] + "-" + d[0];
            }
            $.ajax({
                url: '/api/tasks/private/entry/' + $(this).closest("li[data-id]").data('id'),
                method: 'PUT',
                data: {
                    datetime_deadline: (d == "" ? "NULL" : d)
                },
                error: console.error
            });
        }
    });
    //Hides elements yet to be shown
    $('input.datepicker').filter(function() { return this.value === ""; }).hide();
    $('.checked').hide();

    $('.fa-calendar').unbind('click').click(function () {
        var datepicker = $(this).parent().find(".datepicker");
        $(datepicker).css('background-color: white');
        if(datepicker.is(":visible")){
            if($(datepicker).val() == "")
                datepicker.hide();
            else if(datepicker.is(':focus'))
                datepicker.blur();
            else
                datepicker.focus();
        }
        else{
            datepicker.show();
            datepicker.focus();
        }
    });

    $('li[data-id]').unbind("click").click(function(e){
        if($(e.target).hasClass("fa") || $(e.target).hasClass("datepicker"))
            return;
        var id = $(this).data("id");
        $.ajax({
            url: '/api/tasks/' + id + '/done',
            method: 'PUT'
        });
    });

    $('.fa-user').unbind('click').click(addMembersPopup);



    $("li[data-id]").unbind("click").click(function(e) {
        if($(this).is('.fa-times'))
            return;
        else if(!$(e.target).is('input')) {
            e.preventDefault();
            $(this).find("input[type=checkbox]").prop('checked', $(this).find("input:checked").length == 0);
        }
    });
}

function addNewItem(ul){
    console.log(this);
    $(ul).append(newListItem());

    $("#new-list-item").keypress(function(e){
        if(e.keyCode != 13 && e.which != 13)
            return;
        var ul = $(this).closest("ul");
        var text = $(this).val();
        if(text != "") {
            var t = this;
            saveItemToDB($(this).closest("div[data-id]").data("id"), text, ul, function(){
                $(t).closest("li").remove();
                addNewItem(ul);
                setupItemClicks();
            });
        }
        else {
            setupItemClicks();
            $(this).closest("li").remove();
        }
    }).focusout(function(){
        var ul = $(this).closest("ul");
        var text = $(this).val();
        if(text != "") {
            saveItemToDB($(this).closest("div[data-id]").data("id"), text, ul, function(){
                setupItemClicks();
            });
        }
        $(this).closest("li").remove();
    }).focus();
}

function saveItemToDB(id, item, ul, cb){
    $.ajax({
        url: '/api/tasks/private/entry',
        method: 'POST',
        data: {
            private_todo_list_id: id,
            todo_text: item
        },
        success: function(data){
            $(ul).append(taskItem({todo_id: data.private_todo_list_id, todo_text: data.todo_text}));
            if(cb)
                cb();
        }
    });
}

$('#shop-logout').click(function () {
    $.ajax({
        url: '/api/auth/logout',
        method: 'POST',
        success: function (data) {
            if(!data.login){
                window.location="/login.html";
            }
        }
    });
});

var hexDigits = new Array
("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");

/**
 * This function converts rgb color to hex format.
 * @param rgb
 * @returns {string}
 */
function rgb2hex(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function hex(x) {
    return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}
