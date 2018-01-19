var lang;
var users = [];
var curBudget;
var list, balance, listItem, newListItem, popupTextList, popupList, balanceItem;

$('document').ready(function () {
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
                        $(".fa-plus-circle").html(" " + data["shop-additem"]);
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
                        $(".fa-plus-circle").html(" " + data["shop-additem"]);
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
                "popupTextfieldList.html"
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
            prep();
        }
    });
});

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
                    entries += listItem({
                        entry_text: d.shopping_list_entries[i].entry_text,
                        entry_id: d.shopping_list_entries[i].shopping_list_entry_id
                    });
                }
                $("#addlist").after(list({
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
        /*

        //-------------------Deletes the list------------------------
        $("#shop-delete"+count).click(function () {
=======
    //---------------New list-------------
    var count = 0;
    $('#addlist').click(function () {
        count++;
        $("<div class=\"col-sm liste\" id='listenr"+count+"'><div class='row'>" +
            "<div class='col-sm-7' style='text-align: left'>" +
            "<div id='listname"+count+"' style='margin: 6px'><input type='text' class='form-control ni' id='listnameinput"+count+"'></div>" +
            "<div id='nameforlist"+count+"'><h4>Liste"+count+"</h4></div></div>"+
            "<div class='col-sm-5' style='text-align: right'>" +
            "    <h4><i class=\"fa fa-circle\" aria-hidden=\"true\" style='color: white; text-shadow: 0px 0px 3px #000;' id='whitebutt"+count+"'></i>" +
            "        <i class=\"fa fa-circle\" aria-hidden=\"true\" style='color: lightpink; text-shadow: 0px 0px 3px #000;' id='pinkbutt"+count+"'></i> " +
            "        <i class=\"fa fa-circle\" aria-hidden=\"true\" style='color: #ffec8e; text-shadow: 0px 0px 3px #000;' id='yellowbutt"+count+"'></i> " +
            "        <i class=\"fa fa-circle\" aria-hidden=\"true\" style='color: lightgreen; text-shadow: 0px 0px 3px #000;' id='greenbutt"+count+"'></i></h4></div>" +
            "</div>" +
            "<ul class=\"list-group\" id=\"itemlist"+count+"\"> </ul>"+
            "<ul class=\"list-group\">"+
            "<div class=\"inpi\" id=\"inputitem"+count+"\"><li class=\"list-group-item\" id=\"listitem"+count+"\">" +
            "<input type=\"text\" class=\"form-control ni\" id=\"newitem"+count+"\">" +
            "</li></div><li class=\"list-group-item addi\" id=\"additem"+count+"\"><i class=\"fa fa-plus-circle\" aria-hidden=\"true\"> "+lang["shop-additem"]+"</i></li>" +
            "</ul><i class=\"fa fa-shopping-cart\" aria-hidden=\"true\" id='shoppingcart"+count+"' style='font-size: 1.8vh'> "+lang["shop-buy"]+"</i>" +
            "<i class=\"fa fa-users\" aria-hidden=\"true\" style='font-size: 1.8vh' id='shop-members"+count+"'> "+lang["shop-share"]+"</i>" +
            "<i class=\"fa fa-trash\" aria-hidden=\"true\" id='shop-delete"+count+"' style='font-size: 1.8vh'> "+lang["shop-delete"]+"</i><i class=\"fa fa-money\" style='font-size: 1.8vh' aria-hidden=\"true\" id='shop-balance"+count+"'> "+lang["shop-balance"]+"</i></div>" +
            "<div class=\"messagepop pop\" id=\"shop-popup\">" +
            "   <p align=\"center\" style=\"font-size: 20px\">"+lang["shop-addmemberstolist"]+"</p>" +
            "   <ul class=\"list-group\" id='shop-memberslist"+count+"' style='margin-top: 10px; margin-bottom: 10px; max-height: 30vh;'></ul>" +
            "   <div class=\"row\">" +
            "       <div class=\"col-md-8\" id=\"scrollable-dropdown-menu\"><input class=\"typeahead form-control\" id=\"shop-member"+count+"\"></div>" +
            "       <div class=\"col-md-1\"><button type=\"button\" class=\"btn btn-info\" id=\"shop-adduser"+count+"\">"+lang["shop-adduser"]+"</button></div>" +
            "   </div>" +
            "   <div style=\"margin-top: 5%\"><button align=\"right\" type=\"button\" class=\"btn\" id=\"shop-cancel"+count+"\" style=\"background-color: lightgrey\">"+lang["shop-cancel"]+"</button>" +
            "</div></div>"+
            "<div class='col-sm liste' id='balancediv"+count+"'>" +
            "<h4>Balance</h4><table class='table table-hover table-bordered'><thead><tr><th>Shoppingtrip</th><th>Price</th></tr></thead>" +
            "<tbody><tr><td>Testtrip</td><td>5mill</td></tr></tbody>"+
            "</table><i class=\"fa fa-list\" aria-hidden=\"true\" id='shop-backlist"+count+"'> "+lang["shop-backlist"]+"</i>").insertAfter("#addlist");
        $('#listname'+count).hide();
        $('#balancediv'+count).hide();
        var itemcount = 0;

        //-------------Edit listname------------------
        $('#nameforlist'+count).click(function(){
            var navn = this.id;
            var ide = navn.split("t").pop();
            console.log(ide + " name for list clicked");
            $('#nameforlist'+ide).hide();
            $('#listname'+ide).show();
            $('#listnameinput'+ide).focus();
>>>>>>> tasklist

            var navn = this.id;
            var ide = navn.split("e").pop();
            $("#shop-delete"+ide).html(" Press again to delete");
            $("#shop-delete"+count).click(function () {
                $('#listenr'+ide).remove();
            });
        });

<<<<<<< HEAD
        //-----------------Opens member popup--------------------
=======
        //---------------------Listcolor----------------------
        $('#pinkbutt'+count).click(function () {
            var navn = this.id;
            var ide = navn.split("t").pop(); //listeid
            var name = "listenr"+ide;
>>>>>>> tasklist

        $('#shop-members'+count).on('click', function() {
            console.log("clicked");
            $(this).addClass('selected');
            $('.pop').slideFadeToggle();
        });

        $('#shop-cancel'+count).on('click', function() {
            deselect($('#contact'));
        });

        $.fn.slideFadeToggle = function(easing, callback) {
            return this.animate({ opacity: 'toggle', height: 'toggle' }, 'fast', easing, callback);
        };

        $.ajax({
            'url': '/api/user/all',
            method: "GET",
            success: function(data){
                var cnt = [];
                for(var i = 0; i < data.length; i++){
                    var u = {
                        id: data[i].person_id,
                        name: data[i].forename + " " + (data[i].middlename ? data[i].middlename + " " : "") + data[i].lastname,
                        username: data[i].username
                    };
                    users.push(u);
                    cnt.push(u.name);
                }
                $('#scrollable-dropdown-menu .typeahead').typeahead(null, {
                    name: 'users',
                    limit: 10,
                    source: new Bloodhound({
                        datumTokenizer: Bloodhound.tokenizers.whitespace,
                        queryTokenizer: Bloodhound.tokenizers.whitespace,
                        prefetch: '/api/user/all?slim=1'
                    })
                });
            },
            error: console.error
        });

        $('#shop-member'+count).keypress(function(event) {
            if(event.keyCode == 13 || event.which == 13){
                var navn = this.id;
                var ide = navn.split("r").pop(); //listeid
                addmember(ide);
            }
        });

<<<<<<< HEAD
        $('#shop-adduser'+count).click(function(){
=======
        //-----------------Press add item button opens inputfield--------------
        $('#additem'+count).click(function () {
>>>>>>> tasklist
            var navn = this.id;
            var ide = navn.split("r").pop(); //listeid
            addmember(ide);
        });*/
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