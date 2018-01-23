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

// TODO: FIX
function prep(){
    $.ajax({
        url: '/api/shoppingList/',
        method: 'GET',
        success: function(data){
            for(var j = 0; j < data.length; j++) {
                var d = data[j];
                var entries = "";
                for (var i = 0; i < d.shopping_list_entries.length; i++) {
                    if(d.shopping_list_entries[i].purchased_by_person_id)
                        continue;
                    entries += taskItem({
                        entry_text: d.shopping_list_entries[i].entry_text,
                        entry_id: d.shopping_list_entries[i].shopping_list_entry_id
                    });
                }
                $("#addlist").after(tasklist({
                    task_list_id: d.shopping_list_id,
                    task_list_name: (d.shopping_list_name == "" ? lang["task-default-name"] : d.shopping_list_name),
                    task_list_entries: entries,
                    lang_add_item: lang["task-add-item"],
                    lang_done_items: lang["task-done-tasks"],
                    lang_delete: lang["task-delete"],
                    color_hex: (d.color_hex ? d.color_hex.toString(16) : "FFFFFF")
                }));
            }
            setupClicks();
        }
    });


    //---------------New list-------------
    $('#addlist').click(function () {
        $.ajax({
            url: '/api/shoppingList',
            method: 'POST',
            data: {
                currency_id: 100,
                shopping_list_name: lang["task-default-name"]
            },
            success: function(data){
                $.ajax({
                    url: '/api/shoppingList/' + data.shopping_list_id,
                    method: 'GET',
                    success: function(data){
                        $("#addlist").after(tasklist({
                            shopping_list_id: data.shopping_list_id,
                            shopping_list_name: data.shopping_list_name,
                            shopping_list_entries: "",
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
    $(".list-name").unbind("click").click(function(){
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
            url: '/api/shoppingList/' + id,
            method: 'PUT',
            data: {
                shopping_list_name: text
            }
        });});

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
            url: '/api/shoppingList/' + id,
            method: 'PUT',
            data: {
                shopping_list_name: text
            }
        });
    });

    $(".add-item").unbind("click").click(function(){
        $(this).closest("div").children(".itemlist").append(newListItem());

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
            url: '/api/shoppingList/' + id,
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
            url: '/api/shoppingList/' + id,
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
            url: '/api/shoppingList/' + id,
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
            url: '/api/shoppingList/' + id,
            method: 'PUT',
            data: {
                color_hex: parseInt(rgb2hex($(ls).css('background-color')).split("#")[1], 16)
            }
        });
    });

    $(".fa-money").unbind("click").click(function(){
        var id = $(this).closest("div[data-id]").data("id");
        $.ajax({
            url: '/api/budget/' + id,
            method: 'GET',
            success: function(data){
                console.log(data);
                curBudget = data;
                var entries = "";
                for(var i = 0; i < data.budget_entries.length; i++){
                    entries += "<tr data-id='" + data.budget_entries[i].budget_entry_id + "'><td>" + data.budget_entries[i].entry_datetime + "</td><td>" + data.budget_entries[i].amount + "</td>";
                }
                $("body").append(balance({
                    title: lang["shop-balance"],
                    complete: lang["shop-ok"],
                    data: "data-id='" + id + "'",
                    lang_trip: lang["shop-trip"],
                    lang_price: lang["shop-price"],
                    budget_entries: entries
                }));

                $('tr[data-id]').click(function(){
                    var id = $(this).closest("tr[data-id]").data("id");
                    var entry = null;
                    for(var i = 0; i < curBudget.budget_entries.length; i++){
                        if(curBudget.budget_entries[i].budget_entry_id == id){
                            entry = curBudget.budget_entries[i];
                        }
                    }
                    if(!entry)
                        return;
                    var d = "<li class='list-group-item'>Work in progress (data about a entry)</li>";
                    $(this).closest(".pop").hide();
                    $("body").append(balanceItem({
                        title: entry.entry_datetime,
                        complete: lang["shop-ok"],
                        list: d
                    }));
                    $("#balance-info-complete").click(function(){
                        $(this).closest(".pop").remove();
                        $(".pop").show();
                    });
                });

                $('#popup-complete').click(function(){
                    $(this).closest(".pop").remove();
                });
            },
            error: console.error
        });
    });

    $(".fa-shopping-cart").unbind("click").click(function(){
        var items = $(this).closest("div[data-id]").find(".list-group-item input:checked").closest('li[data-id]');
        if(items.length == 0)
            return;
        var entries = $(items[0]).data("id");
        var list = "<li class=\"list-group-item\">" + $(items[0]).html() + "</li>";
        for(var i = 1; i < items.length; i++){
            entries += "," + $(items[i]).data("id");
            list += "<li class=\"list-group-item\">" + $(items[i]).html() + "</li>";
        }
        $("body").append(popupTextList({
            title: lang["shop-buy-title"],
            list: list,
            textfield: lang["shop-buy-text"],
            cancel: lang["shop-cancel"],
            complete: lang["shop-ok"],
            data: "data-id='" + $(this).closest("div[data-id]").data("id") + "' data-entries='" + entries + "'"
        }));

        $(".pop").find(".fa-times").remove();
        $(".pop").find("input[type=checkbox]").remove();

        $("#popup-cancel").click(function(){
            $(this).closest(".pop").remove();
        });

        $("#popup-complete").click(function(){
            if(isNaN(Number($(this).closest('.pop').find('input').val())))
                return;
            var id = $(this).closest("div[data-id]").data("id");
            var e = $(this).closest("div[data-entries]").data("entries");
            if(Number(e) !== e)
                e = e.split(",");
            else
                e = [e];
            $.ajax({
                url: '/api/budget',
                method: 'POST',
                data: {
                    shopping_list_id: id,
                    amount: Number($(this).closest('.pop').find('input').val()),
                    text_note: e.join(",")
                },
                success: function(data){
                    for(var i = 0; i < e.length; i++){
                        $.ajax({
                            url: '/api/shoppingList/entry/' + e[i],
                            method: 'PUT',
                            data: {
                                shopping_list_id: id,
                                purchased_by_person_id: 2,
                                budget_entry_id: data.budget_entry_id
                            }
                        });
                    }
                }
            });
            for(var i = 0; i < e.length; i++){
                $("div[data-id=" + id + "]").find('li[data-id=' + e[i] + ']').remove();
            }
            $(this).closest(".pop").remove();
        });
    });

    setupItemClicks();
}

function setupItemClicks(){
    $(".fa-times").unbind("click").click(function(){
        var entry_id = $(this).closest("li[data-id]").data("id");
        $.ajax({
            url: '/api/shoppingList/entry/' + entry_id,
            method: 'DELETE',
            error: console.error
        });
        $(this).closest("li[data-id]").remove();
    });

    $("li[data-id]").unbind("click").click(function(e){
        if($(this).is('.fa-times'))
            return;
        else if(!$(e.target).is('input')) {
            e.preventDefault();
            $(this).find("input[type=checkbox]").prop('checked', $(this).find("input:checked").length == 0);
        }
    });
}

function addNewItem(ul){
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
        url: '/api/shoppingList/entry',
        method: 'POST',
        data: {
            shopping_list_id: id,
            entry_text: item
        },
        success: function(data){
            $(ul).append(taskItem({entry_text: item, entry_id: data.shopping_cart_entry_id}));
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
                window.top.location="http://localhost:8000/login.html";
            }
        }
    });
});