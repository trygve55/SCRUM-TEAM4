var lang;
var user;
var curBudget;
var testetest;
var listItem, newListItem, balance, balanceItem, popupTextList, currentShoppingList;

/* Language */
$(document).ready(function () {
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
                    }
                });
            },
            error: console.error
        });
    });

    $.ajax({
        url: '/api/user/getUser',
        method: 'GET',
        data: {
            variables: [
                'forename',
                'lastname' ,
                'email',
                'phone',
                'username',
                'facebook_api_id',
                'shopping_list_id'
            ]
        },
        success: function (data) {
            user = data[0];
            if(data == null){ // ?? sjekk
                return;
            }



            testetest = (data[0].person_id);

            $('#profile-name').text(data[0].forename + '  ' + data[0].lastname);
            $('#p-forenam').val(data[0].forename);
            $('#p-middlenam').val(data[0].middlename);
            $('#p-lastnam').val(data[0].lastname);
            $('#p-usernam').val(data[0].username);
            $('#p-phonenumb').val(data[0].phone);

            $('#profile-email').text(data[0].email);
            $('#profile-phone').text(data[0].phone ? data[0].phone : "");
            $('#profile-username').text(data[0].username == data[0].facebook_api_id ? "" : data[0].username);
            $('#profile-name2').text(data[0].forename + '  ' + data[0].lastname);
            $('#profile-email2').text(data[0].email);
            $('#profile-phone2').text(data[0].phone ? data[0].phone : "");
            $('#profile-username2').text(data[0].username == data[0].facebook_api_id ? "" : data[0].username);
            setupShoppingList();


        }


    });


    $("#but").click(function () {
        console.log(testetest);
        $.ajax({
            url: '/api/user/'+testetest,
            method: 'PUT',
            data:{
                username: $('#p-usernam').val()
            },
            success: function (data) {
                console.log(data)
            },
            error: console.error
        });
    });

    /**
     * Hides buttons, input
     */
    function inits(){

    }

    $('#media').carousel({
        pause: true,
        interval: false
    });

    $.ajax({
        url: '/template',
        method: 'GET',
        data: {
            files: [
                'listItem.html',
                'newListItem.html',
                'balance.html',
                'balanceItem.html',
                'popupTextfieldList.html'
            ]
        },
        success: function (data){
            listItem = Handlebars.compile(data['listItem.html']);
            newListItem = Handlebars.compile(data['newListItem.html']);
            balance = Handlebars.compile(data['balance.html']);
            balanceItem = Handlebars.compile(data['balanceItem.html']);
            popupTextList = Handlebars.compile(data['popupTextfieldList.html']);
        }
    });
});





function setupShoppingList(){
    $.ajax({
        url: "/api/shoppingList/" + user.shopping_list_id,
        method: "GET",
        success: function (data) {
            currentShoppingList = data;
            $('.itemlist').html("");
            for(var i = 0; i < data.shopping_list_entries.length; i++){
                if(data.shopping_list_entries[i].purchased_by_person_id)
                    continue;
                $('.itemlist').append(listItem({
                    entry_id: data.shopping_list_entries[i].shopping_list_entry_id,
                    entry_text: data.shopping_list_entries[i].entry_text
                }));
            }
            setupClicks();
        }
    });
}

function setupClicks(){
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
        var items = $(this).closest("div").find(".list-group-item input:checked").closest('li[data-id]');
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
                    shopping_list_id: currentShoppingList.shopping_list_id,
                    amount: Number($(this).closest('.pop').find('input').val()),
                    text_note: e.join(",")
                },
                success: function(data){
                    for(var i = 0; i < e.length; i++){
                        $.ajax({
                            url: '/api/shoppingList/entry/' + e[i],
                            method: 'PUT',
                            data: {
                                shopping_list_id: currentShoppingList.shopping_list_id,
                                purchased_by_person_id: 2,
                                budget_entry_id: data.budget_entry_id
                            },
                            error: console.error
                        });
                    }
                },
                error: console.error
            });
            for(var i = 0; i < e.length; i++){
                $(".liste").find('li[data-id=' + e[i] + ']').remove();
            }
            $(this).closest(".pop").remove();
        });
    });

    $(".fa-bars").unbind("click").click(function(){
       location.href = "shoppinglist.html";
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
            shopping_list_id: currentShoppingList.shopping_list_id,
            entry_text: item
        },
        success: function(data){
            $(ul).append(listItem({entry_text: item, entry_id: data.shopping_cart_entry_id}));
            if(cb)
                cb();
        }
    });
}