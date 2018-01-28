var lang;
var itemcount = 0;
var tasklist, completedList, completedItem, privateTaskItem, newListItem, tasklistDone;
var mePerson;

$('document').ready(function () {
    //------------------Setting a variable to the logged in user------------

    /**
     * This method retrieves information about the user; person_id, forename and lastname.
     */

    $.ajax({
        url: '/api/user/getUser',
        method: 'GET',
        data: {
            variables: [
                'person_id',
                'forename',
                'lastname'
            ]
        },
        success: function(data){
            mePerson = data[0];
        }
    });

    $.ajax({
        url: '/template',
        method: 'GET',
        data: {
            files: [
                "tasklist.html",
                "completedTasklist.html",
                "completedTask.html",
                "privateTaskItem.html",
                "newListItem.html",
                "tasklistDone.html"
            ]
        },
        success: function(data){
            tasklist = Handlebars.compile(data["tasklist.html"]);
            completedList = Handlebars.compile(data["completedTasklist.html"]);
            completedItem = Handlebars.compile(data["completedTask.html"]);
            privateTaskItem = Handlebars.compile(data["privateTaskItem.html"]);
            newListItem = Handlebars.compile(data["newListItem.html"]);
            tasklistDone = Handlebars.compile(data["tasklistDone.html"]);
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
        success: function(data){
            if(data.length!==0){
                var d = data;
                for(var i=0; i<d.length; i++){

                    if(!d[i].is_deactivated){
                        var tasklistentries = "";
                        var privatetodos = d[i].private_todo_entries;
                        for(var j=0; j<privatetodos.length; j++){
                            if(privatetodos[j].datetime_done == null){
                                tasklistentries += privateTaskItem({
                                    todo_id: privatetodos[j].private_todo_entry_id,
                                    todo_text: privatetodos[j].todo_text
                                });
                            }
                        }
                        $('#addlist').after(tasklist({
                            task_list_id: d[i].private_todo_list_id,
                            task_list_name: d[i].private_todo_list_name,
                            task_list_entries: tasklistentries,
                            lang_add_item: lang["tasks-add-item"],
                            lang_done_items: lang["tasks-done-tasks"],
                            lang_delete: lang["tasks-delete"]
                        }));
                        if(d[i].private_todo_list_name != "" && !d[i].private_todo_list_name){
                            $('div[data-id='+d[i].private_todo_list_id+']').find('.list-name').hide();

                        }else{
                            $('div[data-id='+d[i].private_todo_list_id+']').find('.list-name-div').hide();
                        }

                    }
                }
            }
            setupClicks();
            setupItemClicks()
        },
        error: console.error

    });

    $('#addlist').click(function () {
       $.ajax({
           url: '/api/tasks/private/',
           method: 'POST',
           success: function (data) {
               $('#addlist').after(tasklist({
                   task_list_id: data.success.insertId,
                   lang_add_item: lang["tasks-add-item"],
                   lang_done_items: lang["tasks-done-tasks"],
                   lang_delete: lang["tasks-delete"]
               }));
               setupClicks();
               setupItemClicks()
           }
       })
    });
}

function setupClicks(){
    $(".list-name-input").unbind("focusout").focusout(function(){
        var text = $(this).val();
        var id = $(this).closest("div[data-id]").data("id");
        var h4 = $(this).parent().parent().children(".list-name");
        var lni = this;

        $.ajax({
            url: '/api/tasks/private/list/'+id,
            method: 'PUT',
            data:{
                private_todo_list_name: text
            },
            success: function () {
                $(lni).parent().hide();
                $(h4).show();
                $(h4).text(text);
            },
            error: console.error
        });
    });

    $(".list-name-input").unbind("keypress").keypress(function(e){
        if(e.keyCode != 13 && e.which != 13)
            return;
        var text = $(this).val();
        var id = $(this).closest("div[data-id]").data("id");
        var h4 = $(this).parent().parent().children(".list-name");
        var lni = this;

        $.ajax({
            url: '/api/tasks/private/list/'+id,

            method: 'PUT',
            data:{
                private_todo_list_name: text
            },
            success: function () {
                $(lni).parent().hide();
                $(h4).show();
                $(h4).text(text);
            },
            error: console.error
        });

    });
    $(".list-name").unbind("click").click(function(){
        var title = $(this).html();
        var div = $(this).parent().children(".list-name-div");
        $(div).show();
        $(div).children(".list-name-input").val(title).focus();
        $(this).hide();

    });


    $(".add-item").unbind("click").click(function(){

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
    $(".btn-info").unbind("click").click(function(){
        var listid = $(this).closest('div[data-id]').data("id");
        var name = $(this).closest('div[data-id]').find('.list-name').text();
        var thedonetasks = [];
        var thelist = $(this).closest('div[data-id]');
        var theresetdonetasks = [];
        $.ajax({
            url: '/api/tasks/private/',
            method: 'GET',
            success: function (data) {
                for(var i=0; i<data.length; i++){
                    if(data[i].private_todo_list_id == listid){
                        var alltasks = data[i].private_todo_entries;
                        for(var j=0; j<alltasks.length; j++){

                            if(alltasks[j].datetime_done != null){
                                thedonetasks.push(alltasks[j]);
                            }
                        }
                    }
                }

                if(thedonetasks.length == 0){
                    return;
                }

                var tasklistentries = "";
                for(var i=0; i<thedonetasks.length; i++){
                    tasklistentries += "<li class='list-group-item thechecked' id="+thedonetasks[i].private_todo_entry_id+"><i class=\"fa fa-check-circle-o\" aria-hidden=\"true\" style='font-size: 15px;'></i> "+thedonetasks[i].todo_text+"</li>";
                }
                var savedList = thelist.html();
                thelist.html(tasklistDone({
                    task_list_name: name,
                    task_list_entries: tasklistentries,
                    lang_go_back: lang["tasks-go-back"]
                }));

                $(".thechecked").unbind("click").click(function () {
                    var thisid = $(this).attr("id");
                    var thistext = $(this).text();
                    var theitem = this;
                    $.ajax({
                        url: '/api/tasks/private/entry/'+thisid,
                        method: 'PUT',
                        data:{
                            datetime_done: null
                        },
                        success: function(){
                            $(theitem).remove();
                            theresetdonetasks.push(privateTaskItem({
                                todo_id: thisid,
                                todo_text: thistext
                            }));
                        },
                        error: console.error
                    });

                });
                $(".btn-info").unbind("click").click(function () {
                    thelist.html(savedList);
                    for(var i=0; i<theresetdonetasks.length; i++){
                        thelist.children('.itemlist').append(theresetdonetasks[i]);
                    }
                    setupClicks();
                    setupItemClicks();
                });
            },
            error: console.error
        });
    });
    $('.btn-danger').unbind("click").click(function () {
        var listid = $(this).closest("div[data-id]").data("id");
        var thelist = $(this).closest('div[data-id]');
        $.ajax({
            url: '/api/tasks/private/list/'+listid,
            method: 'PUT',
            data: {
                is_deactivated: true
            },
            success: function () {
                $(thelist).remove();

            },
            error: console.error
        })
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
    $("li[data-id]").unbind("click").click(function(e){
        var thisid = $(this).data("id");
        var now = new Date().toISOString().replace("T", " ").split(".")[0];
        var theitem = this;
        if($(this).is('.fa-times'))
            return;
        else if(!$(e.target).is('input')) {
            e.preventDefault();
            $.ajax({
                url: '/api/tasks/private/entry/'+thisid,
                method: 'PUT',
                data:{
                    datetime_done: now
                },
                success: function(){
                    $(theitem).remove();
                },
                error: console.error
            })
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
function saveItemToDB(dataid, item, ul, cb){

    $.ajax({
        url: '/api/tasks/private/entry',
        method: 'POST',
        data: {
<<<<<<< HEAD
            private_todo_list_id: id,
            todo_text: item
        },
        success: function(data){
            $(ul).append(taskItem({todo_id: data.private_todo_list_id, todo_text: data.todo_text}));
=======
            private_todo_list_id: dataid,
            todo_text: item
        },
        success: function(data){
            $(ul).append(privateTaskItem({
                todo_id: data.private_todo_list_id,
                todo_text: item
            }));
>>>>>>> tasklist
            if(cb)
                cb();
        },
        error: console.error
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
