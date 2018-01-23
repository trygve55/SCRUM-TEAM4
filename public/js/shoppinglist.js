var lang;
var users = [];
var lists = [];
var newmembers = [];
var curBudget, currencies;
var list, balance, listItem, newListItem, popupTextList, popupList, balanceItem, listReplace, popupMembers;
var me;

$('document').ready(function () {
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
            me = data[0];
        }
    });
    $.ajax({
        url: '/api/currency',
        method: 'GET',
        success: function (data){
            var h = "";
            for(var i = 0; i < data.length; i++){
                h += '<option value="' + data[i].currency_id + '">' + data[i].currency_short + '</option>';
            }
            currencies=h;
        }
    });
    //--------------Languages------------
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
            $(".fa-money").html(" " + data["shop-balance"]);
            $(".fa-shopping-cart").html(" " + data["shop-buy"]);
            $(".fa-users").html(" " + data["shop-share"]);
            $(".fa-trash").html(" " + data["shop-delete"]);
            $(".fa-plus-circle").html(" " + data["shop-additem"]);
        }
    });
    $('#login-norway').click(function () {
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
                        lang = data;

                        for (var p in data) {
                            if (data.hasOwnProperty(p)) {
                                $("#" + p).html(data[p]);
                            }
                        }
                        $(".fa-money").html(" " + data["shop-balance"]);
                        $(".fa-shopping-cart").html(" " + data["shop-buy"]);
                        $(".fa-users").html(" " + data["shop-share"]);
                        $(".fa-trash").html(" " + data["shop-delete"]);
                        $(".fa-plus-circle").html(" " + data["shop-add-item"]);
                        $(".list-name-input").attr('placeholder', data["shop-list-name-input"]);

                    }
                });
            }
        });
    });
    $('#login-england').click(function () {
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
                        lang = data;

                        for (var p in data) {
                            if (data.hasOwnProperty(p)) {
                                $("#" + p).html(data[p]);
                            }
                        }
                        $(".fa-money").html(" " + data["shop-balance"]);
                        $(".fa-shopping-cart").html(" " + data["shop-buy"]);
                        $(".fa-users").html(" " + data["shop-share"]);
                        $(".fa-trash").html(" " + data["shop-delete"]);
                        $(".fa-plus-circle").html(" " + data["shop-add-item"]);
                        $(".list-name-input").attr('placeholder', data["shop-list-name-input"]);
                    }
                });
            }
        });
    });

    $.ajax({
        url: '/template',
        method: 'GET',
        data: {
            files: [
                "list.html",
                "balance.html",
                "balanceItem.html",
                "listItem.html",
                "newListItem.html",
                "popupList.html",
                "popupTextfieldList.html",
                "listReplace.html",
                "popupMembers.html"
            ]
        },
        success: function(data){
            list = Handlebars.compile(data["list.html"]);
            balance = Handlebars.compile(data["balance.html"]);
            listItem = Handlebars.compile(data["listItem.html"]);
            newListItem = Handlebars.compile(data["newListItem.html"]);
            popupTextList = Handlebars.compile(data["popupTextfieldList.html"]);
            popupList = Handlebars.compile(data["popupList.html"]);
            balanceItem = Handlebars.compile(data["balanceItem.html"]);
            listReplace = Handlebars.compile(data["listReplace.html"]);
            popupMembers = Handlebars.compile(data["popupMembers.html"]);
            prep();
        }
    });
});

function prep(){
    $.ajax({
        url: '/api/shoppingList/',
        method: 'GET',
        success: function(data){
            lists = data;
            for(var j = 0; j < data.length; j++) {
                var d = data[j];
                var entries = "";
                for (var i = 0; i < d.shopping_list_entries.length; i++) {
                    if(d.shopping_list_entries[i].purchased_by_person_id)
                        continue;
                    entries += listItem({
                        entry_text: d.shopping_list_entries[i].entry_text,
                        entry_id: d.shopping_list_entries[i].shopping_list_entry_id
                    });
                }
                if(!d.is_hidden){
                    $("#addlist").after(list({
                        shopping_list_id: d.shopping_list_id,
                        shopping_list_name: (d.shopping_list_name == "" ? lang["shop-list-name-input"] : d.shopping_list_name),
                        shopping_list_entries: entries,
                        lang_add_item: lang["shop-add-item"],
                        lang_currency: currencies,
                        lang_buy_items: lang["shop-buy"],
                        lang_share_members: lang["shop-share"],
                        lang_delete_list: lang["shop-delete"],
                        lang_settlement: lang["shop-balance"],
                        color_hex: (d.color_hex ? d.color_hex.toString(16) : "FFFFFF")
                    }));
                    $('div[data-id=' + d.shopping_list_id + ']').find("select").val(d.currency_id);
                }
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
                shopping_list_name: lang["shop-list-name-input"]
            },
            success: function(data){
                $.ajax({
                    url: '/api/shoppingList/' + data.shopping_list_id,
                    method: 'GET',
                    success: function(data){
                        lists.push(data);
                        $("#addlist").after(list({
                            shopping_list_id: data.shopping_list_id,
                            shopping_list_name: data.shopping_list_name,
                            shopping_list_entries: "",
                            lang_add_item: lang["shop-add-item"],
                            lang_buy_items: lang["shop-buy"],
                            lang_share_members: lang["shop-share"],
                            lang_delete_list: lang["shop-delete"],
                            lang_settlement: lang["shop-balance"],
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
    $(".currency-input").change(function () {
        var newCurrId =  $(this).val();
        var listid = $(this).parent().attr("data-id");

       $.ajax({
           url: '/api/shoppingList/' + listid,
           method: 'PUT',
           data: {
               currency_id: newCurrId
           }
       });
    });

    $(".list-name").unbind("click").click(function(){
        var listId = $(this).closest("div[data-id]").data("id");
        var title = $(this).html();
        $(this).hide();
        var div = $(this).parent().children(".list-name-div");
        $(div).show();
        $(div).children(".list-name-input").val(title).focus();
    });

    /*$(".list-name-input").unbind("focusout").focusout(function(){
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
        });});*/

    $(".list-name-input").unbind("keypress").keypress(function(e){
        if(e.keyCode != 13 && e.which != 13)
            return;
        var text = $(this).val();
        if(text === ""){
            $(this).parent().hide();
            $(this).parent().parent().children(".list-name").show();
        }else{
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
                },
                error: console.error
            });
        }
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
    function colorRefresh() {
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
    }
    colorRefresh();

    $(".fa-users").unbind("click").click(function () {
        var h = "";
        var theuser;
        var li = $(this).parent().attr("data-id");
        for(var j=0; j<lists.length; j++){
            if(lists[j].shopping_list_id==li){
                var peps = lists[j].persons;
                for(var k=0; k<peps.length; k++){
                    theuser = {
                        name: peps[k].forename + " " + peps[k].lastname
                    };
                    users.push(theuser);
                    h += "<li class='list-group-item'>"+ peps[k].forename + " " + peps[k].lastname+"<i data-pid=" + k + " style=\"float: right;\" class=\"fa fa-times\" area-hidden=\"true\"></i></li>";
                }
            }
        }
        $("body").append(popupMembers({
            members: lang["shop-add-members"],
            cancel: lang["shop-cancel"],
            complete: lang["shop-ok"],
            textfield: lang["shop-input-members"],
            memberlist: h,
            data: "data-id='"+li+"'"
        }));


        $('#scrollable-dropdown-menu .typeahead').typeahead({
                highlight: true
            },
            {
                name: 'user-names',
                display: 'name',
                source: new Bloodhound({
                    datumTokenizer: function(d){
                        return Bloodhound.tokenizers.whitespace(d.name).concat([d.email]);
                    },
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    prefetch: '/api/user/all?slim=1'
                }),
                templates: {
                    empty: [
                        '<div class="empty-message">',
                        'No users found',
                        '</div>'
                    ].join('\n'),
                    suggestion: Handlebars.compile('<div>{{name}} – {{email}}</div>')
                }
            });

        $(".typeahead").bind('typeahead:select', function(a, data){
            console.log(data);
            newmembers.push(data);
            users.push(data);
            updateList();
        });

        $(".typeahead").bind('typeahead:close', function(){
            $(".typeahead").val("");
        });

        $("#popup-members-cancel").click(function () {
            $(this).closest(".pop").remove();
        });
        $("#popup-members-complete").click(function () {
            var li = $(this).closest('div[data-id]').attr('data-id');
            for(var j=0; j<newmembers.length; j++){
                $.ajax({
                    url: '/api/shoppingList/invite',
                    method: 'POST',
                    data: {
                        shopping_list_id: li,
                        person_id: newmembers[j].id
                    },
                    error: console.error
                })
            }
        });
    });

    $(".fa-money").unbind("click").click(function(){
        var id = $(this).closest("div[data-id]").data("id");
        var mbutton = this;
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
                $(mbutton).closest("div[data-id]").html(balance({
                    title: lang["shop-balance"],
                    complete: lang["shop-ok"],
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
                    var entries = "";
                    console.log(lists);
                    console.log(id);
                    for(var j = 0; j < lists.length; j++) {
                        if(lists[j].shopping_list_id != id)
                            continue;
                        var d = lists[j];
                        for (var i = 0; i < d.shopping_list_entries.length; i++) {
                            if (d.shopping_list_entries[i].purchased_by_person_id)
                                continue;
                            entries += listItem({
                                entry_text: d.shopping_list_entries[i].entry_text,
                                entry_id: d.shopping_list_entries[i].shopping_list_entry_id
                            });
                        }
                        break;
                    }
                    $(this).closest("div[data-id]").html(listReplace({
                        shopping_list_id: d.shopping_list_id,
                        shopping_list_name: (d.shopping_list_name == "" ? lang["shop-list-name-input"] : d.shopping_list_name),
                        shopping_list_entries: entries,
                        lang_add_item: lang["shop-add-item"],
                        lang_buy_items: lang["shop-buy"],
                        lang_share_members: lang["shop-share"],
                        lang_delete_list: lang["shop-delete"],
                        lang_settlement: lang["shop-balance"],
                        color_hex: (d.color_hex ? d.color_hex.toString(16) : "FFFFFF")
                    }));
                    setupClicks();
                    colorRefresh();
                });
            },
            error: console.error
        });
    });

    $(".fa-trash").unbind("click").click(function () {
        var listid = $(this).parent().attr("data-id");
        $(this).closest("div[data-id]").remove();
        $.ajax({
            url: '/api/shoppingList/info/' + listid,
            method: 'PUT',
            data: {
                "is_hidden": true
            },
            error: console.error
        });
    });

    $(".fa-shopping-cart").unbind("click").click(function(){
        var items = $(this).closest("div[data-id]").find(".list-group-item input:checked").closest('li[data-id]');
        if(items.length == 0)
            return;
        var entries = $(items[0]).data("id");
        var number = 1;
        var list = "<li class=\"list-group-item\">"+number+". " + $(items[0]).text() + "</li>";
        for(var i = 1; i < items.length; i++){
            number++;
            entries += "," + $(items[i]).data("id");
            list += "<li class=\"list-group-item\">"+number+". " + $(items[i]).text()+ "</li>";
        }
        var li = $(this).parent().attr("data-id");
        var curr = "*";
        for(var i=0; i<lists.length; i++){
            if(lists[i].shopping_list_id==li){
                curr = lists[i].currency_short;
            }
        }
        /*$.ajax({
            url: '/api/shoppingList/info/' + li,
            method: 'PUT',
            data: {
                "is_hidden": true
            },
            error: console.error
        });
        var lbi =*/
        $("body").append(popupTextList({
            title: lang["shop-buy-title"],
            list: list,
            textfield: lang["shop-buy-text"],
            textfield_com: lang["shop-entry-name"],
            not_needed: lang["shop-not-needed"],
            textfield_label: lang["shop-entry-label"],
            currency: curr,
            //label-input: lbi,
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
                            },
                            error: console.error
                        });
                    }
                },
                error: console.error
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
            $(ul).append(listItem({entry_text: item, entry_id: data.shopping_cart_entry_id}));
            if(cb)
                cb();
        }
    });
}

function addmember(ide){
    var member = $('#shop-member'+ide).val();
    $('#shop-memberslist'+ide).prepend('<li class="list-group-item">'+member+'</li>');
    $('#shop-member'+ide).val('');
}

var hexDigits = new Array
("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");

//Function to convert rgb color to hex format
function rgb2hex(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function hex(x) {
    return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}

function updateList(){
    console.log("updatelist called");
    var h = "";
    for(var i = 0; i < users.length; i++){
        h += '<li class="list-group-item">' + users[i].name + '<i data-pid="' + users[i].id + '" style="float: right;" class="fa fa-times" area-hidden="true"></i></li>';
    }
    console.log(h);
    $(".memberlist").html(h);
    $(".fa-times").click(function(){
        var id = $(this).data('pid');
        for(var i = 0; i < users.length; i++){
            if(users[i].id == id){
                users.splice(i, 1);
                break;
            }
        }
    });

}