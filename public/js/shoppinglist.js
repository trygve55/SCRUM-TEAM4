var lang;
var users = [];
var lists = [];
var newmembers = [];
var curBudget, currencies;
var list, balance, listItem, newListItem, popupTextList, popupList, balanceItem, listReplace, popupMembers, newlabel;
var me;
var generalLabels;
var thenewlabel, byersSelect, byersAll;
var buyers = [];

$('document').ready(function () {
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
    //------------------Setting a variable to the logged in user------------
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
    //------------------Setting a variable to all currencies in the database------------
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
            generalLabels = [data["newlabel"],data["label1"], data["label2"], data["label3"], data["label4"]];
            thenewlabel = data["newlabel"];
            byersSelect = data["byers-select"];
            byersAll = data["byers-all"];
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
                        generalLabels = [data["newlabel"],data["label1"], data["label2"], data["label3"], data["label4"]];
                        thenewlabel = data["newlabel"];
                        byersSelect = data["byers-select"];
                        byersAll = data["byers-all"];

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
                        generalLabels = [data["newlabel"],data["label1"], data["label2"], data["label3"], data["label4"]];
                        thenewlabel = data["newlabel"];
                        byersSelect = data["byers-select"];
                        byersAll = data["byers-all"];


                    }
                });
            }
        });
    });

    //----------------Importes all html-templates------------
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
                "popupMembers.html",
                "newlabel.html"
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
            newlabel = Handlebars.compile(data["newlabel.html"]);
            prep();
        }
    });
});

function prep(){
    //-----------------Gets all shoppinglists and shows them in the website------------
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
//-----------------Sets up the buttons so the functionality will work------------
function setupClicks(){
    //-----------------Change currency------------
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

    //-----------------Opens inputfield for changing listtitle------------
    $(".list-name").unbind("click").click(function(){
        var listId = $(this).closest("div[data-id]").data("id");
        var title = $(this).html();
        $(this).hide();
        var div = $(this).parent().children(".list-name-div");
        $(div).show();
        $(div).children(".list-name-input").val(title).focus();
    });

    //-----------------Sets new listtitle when enter is pressed------------
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

    //-----------------Add new item to list------------
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

    //-----------------Sets up colorbuttons------------
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

    //-----------------Opens a popup when usersbutton is clicked------------
    $(".fa-users").unbind("click").click(function () {
        var h = "";
        var theuser;
        var li = $(this).parent().attr("data-id");

        //Adds members of list to a memberlist
        for(var j=0; j<lists.length; j++){
            if(lists[j].shopping_list_id==li){
                var peps = lists[j].persons;
                for(var k=0; k<peps.length; k++){
                    theuser = {
                        name: peps[k].forename + " " + peps[k].lastname
                    };
                    users.push(theuser);
                    h += "<li class='list-group-item'>"+ peps[k].forename + " " + peps[k].lastname+"</li>";
                }
            }
        }

        //Opens popup
        $("body").append(popupMembers({
            members: lang["shop-add-members"],
            cancel: lang["shop-cancel"],
            complete: lang["shop-ok"],
            textfield: lang["shop-input-members"],
            memberlist: h,
            data: "data-id='"+li+"'"
        }));

        //Shows suggestions when characters is typed
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

        //Adds member to list when clicked
        $(".typeahead").bind('typeahead:select', function(a, data){
            newmembers.push(data);
            users.push(data);
            updateList();
            $(".typeahead").val("");
        });

        //Empty inputfield when its closed
        $(".typeahead").bind('typeahead:close', function(){
            $(".typeahead").val("");
        });

        //Deletes all new members and closes the popup
        $("#popup-members-cancel").click(function () {
            newmembers = [];
            $(this).closest(".pop").remove();
        });

        //Adds members to list in database (Sends invite)
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
            $(this).closest(".pop").remove();
            newmembers=[];
        });
    });

    //----------------Opens settlement box when money-button is clicked----------
    $(".fa-money").unbind("click").click(function(){
        var id = $(this).closest("div[data-id]").data("id");
        var sign = "";
        for(var j=0; j<lists.length; j++){
            if(lists[j].shopping_list_id==id){
                sign = lists[j].currency_sign;
            }
        }
        var mbutton = this;
        $.ajax({
            url: '/api/budget/' + id,
            method: 'GET',
            success: function(data){
                curBudget = data;
                var entries = "";

                //Adds all budget-entries to the list
                for(var i = data.budget_entries.length-1; i >= 0 ; i--){
                    entries += "<tr data-id='" + data.budget_entries[i].budget_entry_id + "'><td>" + data.budget_entries[i].text_note +"</td><td>" + data.budget_entries[i].amount/100 + " "+sign+"</td>";
                }
                $(mbutton).closest("div[data-id]").html(balance({
                    title: lang["shop-balance"],
                    complete: lang["shop-ok"],
                    lang_trip: lang["shop-trip"],
                    lang_price: lang["shop-price"],
                    budget_entries: entries
                }));

                //Opens popup when a budget-entry is clicked
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
                    var entrylist = entry.budget_shopping_list_entries;
                    var g = "";
                    for(var j=0; j<entrylist.length; j++){
                        g += "<li class='list-group-item'>"+entrylist[j].entry_text+"</li>";
                    }
                    var p = "";
                    var payerlist = entry.persons_to_pay;
                    for(var k=0; k<payerlist.length; k++){
                        if(payerlist[k].person_id == me.person_id){
                            if(me.person_id == entry.added_by.person_id){
                                p += "<li class='list-group-item'>"+lang["me"]+"</li>";
                            }else{
                                p += "<li class='list-group-item'><div class='row'><div class='col-sm'>"+lang["me"]+"</div><div class='col-sm' style='text-align: right'><button type='button' class='btn' style='background-color: lightgrey'>"+lang["settle"]+"</button></div></div></li>";
                            }
                        }else{
                            p += "<li class='list-group-item'>"+payerlist[k].forename+" "+payerlist[k].lastname+"</li>";
                        }
                    }
                    $(this).closest(".pop").hide();
                    var datetime = entry.entry_datetime;
                    var year = datetime.split("-")[0]; //2018
                    var month = datetime.split("-")[1]; //01
                    var date = datetime.split("-")[2].split("T")[0]; //23
                    var time = datetime.split("T")[1].split(".")[0]; //09:23:02
                    var timeNsec = time.split(":")[0] + ":" + time.split(":")[1];
                    var formattedDateTime = date + "/" + month + "/" + year + ", " + timeNsec;
                    var la = entry.budget_entry_type.budget_entry_type_name;
                    var bc = Number(entry.budget_entry_type.budget_entry_type_color).toString(16);
                    var lh = '<div style="background-color: #'+bc+'; padding-left: 1vh; padding-top: 0.5vh; padding-bottom: 0.5vh;border-radius: 15px;">'+lang["label-label"]+': '+la+'</div>'
                    $("body").append(balanceItem({
                        comment: entry.text_note,
                        bought_by: entry.added_by.forename + " " + entry.added_by.lastname,
                        bought_by_label: lang["bought-by-label"],
                        cost: entry.amount/100 + " " + sign,
                        cost_label: lang["cost-label"],
                        payers: p,
                        labelhtml: lh,
                        payers_label: lang["payers-label"],
                        goods: g,
                        goods_label: lang["goods-label"],
                        time: formattedDateTime,
                        time_label: lang["time-label"],
                        complete: lang["shop-ok"]
                    }));
                    $("#balance-info-complete").click(function(){
                        $(this).closest(".pop").remove();
                        $(".pop").show();
                    });
                });


                $('#popup-complete').click(function(){
                    var entries = "";
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
                        lang_currency: currencies,
                        lang_settlement: lang["shop-balance"],
                        color_hex: (d.color_hex ? d.color_hex.toString(16) : "FFFFFF")
                    }));
                    $('div[data-id=' + id + ']').find("select").val(d.currency_id);
                    setupClicks();
                    colorRefresh();
                });
            },
            error: console.error
        });
    });

    //-------------Deletes list-----------------
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

    //--------------Buy items. Opens popup----------------
    $(".fa-shopping-cart").unbind("click").click(function(){
        var li = $(this).parent().attr("data-id");
        var mycart = this;
        var h = "";
        h += '<option value="-1">----</option>';
        h += '<option value="0">' + generalLabels[0] + '</option>';
        var labelz = [];
        //-----------------Open popup with bought items--------------
        $.ajax({
            url: '/api/budget/entryType',
            method: 'GET',
            data: {
                shopping_list_id: li
            },
            success: function (data) {
                for (i = 0; i < data.budget_entry_types.length; i++) {
                    labelz[i] = data.budget_entry_types[i].entry_type_name;
                    h += '<option value="' + data.budget_entry_types[i].budget_entry_type_id + '">' + data.budget_entry_types[i].entry_type_name + '</option>';
                }
                var found = false;
                for (var j = 1; j < generalLabels.length; j++) {
                    for (var k = 0; k < labelz.length; k++) {
                        if (labelz[k] == generalLabels[j]) {
                            found = true;
                        }
                    }
                    if (!found) {
                        h += '<option value="0">' + generalLabels[j] + '</option>';
                    }
                    found = false;
                }

                var items = $(mycart).closest("div[data-id]").find(".list-group-item input:checked").closest('li[data-id]');
                if (items.length == 0)
                    return;
                var entries = $(items[0]).data("id");
                var number = 1;
                var list = "<li class=\"list-group-item\">" + number + ". " + $(items[0]).text() + "</li>";

                var itemsstring = []; //a table with items in stringformat
                itemsstring[0] = $(items[0]).text().trim();

                //adds bought items to the list in the popup
                for (var i = 1; i < items.length; i++) {
                    number++;
                    entries += "," + $(items[i]).data("id");
                    list += "<li class=\"list-group-item\">" + number + ". " + $(items[i]).text() + "</li>";
                    itemsstring[i] = $(items[i]).text().trim();
                }

                //adds currency value at cost-label
                var curr = "*";
                for (var i = 0; i < lists.length; i++) {
                    if (lists[i].shopping_list_id == li) {
                        curr = lists[i].currency_short;
                    }
                }
                var bye = '<option>'+lang["byers-all"]+'</option>';
                bye += '<option>'+lang["byers-select"]+'</option>';

                //Append popup
                $("body").append(popupTextList({
                    title: lang["shop-buy-title"],
                    list: list,
                    textfield: lang["shop-buy-text"],
                    textfield_com: lang["shop-entry-name"],
                    not_needed: lang["shop-not-needed"],
                    textfield_label: lang["shop-entry-label"],
                    currency: curr,
                    advanced: lang["advanced"],
                    byers_label: lang["byers-label"],
                    byers: bye,
                    label: h,
                    cancel: lang["shop-cancel"],
                    complete: lang["shop-ok"],
                    data: "data-id='" + $(mycart).closest("div[data-id]").data("id") + "' data-entries='" + entries + "'"
                }));

                //If 'select users' are selected in Byers
                $("#byersid").change(function () {

                    if ($("#byersid").find('option:selected').html() == byersSelect) {
                        $('.addbyers').show();
                        /**
                         * This method allows a user to search all names or emails in the database by simply
                         * entering a letter, optionally more, when adding more members to a group
                         */
                        $('#scrollable-dropdown-menu2 .typeahead2').typeahead({
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
                                    prefetch: '/api/shoppingList/'+li+'/users'
                                }),
                                templates: {
                                    empty: [
                                        '<div class="empty-message">',
                                        'No users found',
                                        '</div>'
                                    ].join('\n'),
                                    suggestion: Handlebars.compile('<div>{{name}} – {{email}}</div>')
                                }
                            }
                        );

                        $(".typeahead2").bind('typeahead:select', function(a, data){
                            if(!check(data))
                                return;
                            buyers.push(data);
                            updateList2();
                        });

                        $(".typeahead2").bind('typeahead:close', function(){
                            $(".typeahead2").val("");
                        });

                    }
                    if($("#byersid").find('option:selected').html() == byersAll){
                        $('.addbyers').hide();

                    }
                });

                //if labelscrolldown changes value
                $("#labelid").change(function () {
                    //if new label is selected
                    if ($("#labelid").find('option:selected').html() == thenewlabel) {
                        $('.labelrow').after(newlabel({
                            "new_label_color": lang["new-label-color"],
                            "new_label_name": lang["new-label-name"]
                        }));


                        $('#newlabelinput').focus();
                    } else {
                        //if others are selected and newlabelinput is showing
                        if ($('#new-label').length) {
                            $('#new-label').remove();
                        }
                    }

                    //if focus goes out from newlabelinput, make red
                    $('#newlabelinput').focusout(function () {
                        if ($('#newlabelinput').val() == "") {
                            $('#newlabelinput').addClass("is-invalid");
                        }
                    });

                    //if focus goes in to newlabelinput, remove red
                    $('#newlabelinput').focusin(function () {
                        $('#newlabelinput').removeClass("is-invalid");
                    });
                });
                //if cancel is pressed
                $("#popup-cancel").click(function () {
                    $(this).closest(".pop").remove();
                });

                //if OK is pressed
                $("#popup-complete").click(function () {
                    //if no value is given to the cost input, do nothing
                    if (isNaN(Number($(this).closest('.pop').find('input').val())))
                        return;

                    var id = $(this).closest("div[data-id]").data("id"); //listid
                    var e = $(this).closest("div[data-entries]").data("entries"); //entries in numbervalue
                    var theitemss = itemsstring.join(" ,");

                    var comment = $(this).closest('.pop').find('#shop-entry-name').val();
                    var textnote;
                    var theis = this;

                    //if no comment is given, text_note is set to a string of all items bought
                    if (comment == "") {
                        textnote = theitemss;
                    } else {
                        textnote = comment;
                    }
                    if (Number(e) !== e)
                        e = e.split(",");
                    else
                        e = [e];

                    //Id of label chosen
                    var labelid;
                    if ($(this).closest('.pop').find('.label-input').val() == -1) { //If "none" is selected
                        //Add new shoplist-entry w/o label
                        $.ajax({
                            url: '/api/budget',
                            method: 'POST',
                            data: {
                                shopping_list_id: id,
                                shopping_list_entry_ids: e,
                                amount: Number($(this).closest('.pop').find('input').val())*100,
                                text_note: textnote
                            },
                            success: function (data) {
                                //Set all entries to bought
                                for (var i = 0; i < e.length; i++) {
                                    $.ajax({
                                        url: '/api/shoppingList/entry/' + e[i],
                                        method: 'PUT',
                                        data: {
                                            shopping_list_id: id,
                                            purchased_by_person_id: me.person_id,
                                            budget_entry_id: data.budget_entry_id
                                        },
                                        success: function () {
                                            //Removes all bought items from shoppinglist
                                            for (var i = 0; i < e.length; i++) {
                                                $("div[data-id=" + id + "]").find('li[data-id=' + e[i] + ']').remove();
                                            }
                                            //Closes popup
                                            $(".pop").remove();
                                        },
                                        error: console.error
                                    });
                                }
                            },
                            error: console.error
                        });
                    } else {
                        if ($(this).closest('.pop').find('.label-input').val() == 0) { //If general labels are selected
                            //The text of the selected label
                            var selec = $(this).closest('.pop').find('.label-input').find('option:selected').html();
                            if (selec == thenewlabel) { //If new label are selected
                                var l = $('#newlabelinput').val();
                                var found = false;
                                for(var j=0; j<labelz.length; j++){
                                    if(labelz[i]==l){
                                        found=true;
                                    }
                                }
                                if (l == "" || found) {
                                    $('#newlabelinput').addClass("is-invalid");
                                } else {
                                    //Add new label to DB
                                    var colorlab = $('#newlabelcolorinput').val();
                                    if(colorlab==""){
                                        colorlab = parseInt('23e05c', 16);
                                    }else{
                                        colorlab = parseInt(colorlab, 16);
                                    }
                                    console.log(parseInt('23e05c', 16));
                                    $.ajax({
                                        url: '/api/budget/entryType',
                                        method: 'POST',
                                        data: {
                                            entry_type_name: l,
                                            entry_type_color: colorlab,
                                            shopping_list_id: id
                                        },
                                        success: function (data) {
                                            //Set labelid to the id of selected label
                                            $.ajax({
                                                url: '/api/budget',
                                                method: 'POST',
                                                data: {
                                                    shopping_list_id: id,
                                                    shopping_list_entry_ids: e,
                                                    budget_entry_type_id: data.budget_entry_type_id,
                                                    amount: Number($(theis).closest('.pop').find('input').val())*100,
                                                    text_note: textnote
                                                },
                                                success: function (data) {
                                                    //Set all items to bought
                                                    for (var i = 0; i < e.length; i++) {
                                                        $.ajax({
                                                            url: '/api/shoppingList/entry/' + e[i],
                                                            method: 'PUT',
                                                            data: {
                                                                shopping_list_id: id,
                                                                purchased_by_person_id: me.person_id,
                                                                budget_entry_id: data.budget_entry_id,
                                                                budget_entry_type_id: labelid
                                                            },
                                                            success: function(){
                                                                //Removes all bought items from shoppinglist
                                                                for (var i = 0; i < e.length; i++) {
                                                                    $("div[data-id=" + id + "]").find('li[data-id=' + e[i] + ']').remove();
                                                                }
                                                                //Closes popup
                                                                $(".pop").remove();
                                                            },
                                                            error: console.error
                                                        });
                                                    }
                                                },
                                                error: console.error
                                            });
                                        },
                                        error: console.error
                                    });
                                }
                            } else { //If other general labels are selected
                                //Add general label to DB
                                $.ajax({
                                    url: '/api/budget/entryType',
                                    method: 'POST',
                                    data: {
                                        entry_type_name: selec,
                                        shopping_list_id: id
                                    },
                                    success: function (data) {
                                        //Set labelid to id of the new label
                                        $.ajax({
                                            url: '/api/budget',
                                            method: 'POST',
                                            data: {
                                                shopping_list_id: id,
                                                shopping_list_entry_ids: e,
                                                budget_entry_type_id: data.budget_entry_type_id,
                                                amount: Number($(theis).closest('.pop').find('input').val())*100,
                                                text_note: textnote
                                            },
                                            success: function (data) {
                                                //Set all items to bought
                                                for (var i = 0; i < e.length; i++) {
                                                    $.ajax({
                                                        url: '/api/shoppingList/entry/' + e[i],
                                                        method: 'PUT',
                                                        data: {
                                                            shopping_list_id: id,
                                                            purchased_by_person_id: me.person_id,
                                                            budget_entry_id: data.budget_entry_id,
                                                            budget_entry_type_id: labelid
                                                        },
                                                        success: function(){
                                                            //Removes all bought items from shoppinglist
                                                            for (var i = 0; i < e.length; i++) {
                                                                $("div[data-id=" + id + "]").find('li[data-id=' + e[i] + ']').remove();
                                                            }
                                                            //Closes popup
                                                            $(".pop").remove();
                                                        },
                                                        error: console.error
                                                    });
                                                }
                                            },
                                            error: console.error
                                        });
                                    },
                                    error: console.error
                                });
                            }
                        } else { //If own labels are selected
                            //Set labelid to the label-id
                            labelid = $(this).closest('.pop').find('.label-input').val();
                            $.ajax({
                                url: '/api/budget',
                                method: 'POST',
                                data: {
                                    shopping_list_id: id,
                                    shopping_list_entry_ids: e,
                                    budget_entry_type_id: labelid,
                                    amount: Number($(theis).closest('.pop').find('input').val())*100,
                                    text_note: textnote
                                },
                                success: function (data) {
                                    //Set all items to bought
                                    for (var i = 0; i < e.length; i++) {
                                        $.ajax({
                                            url: '/api/shoppingList/entry/' + e[i],
                                            method: 'PUT',
                                            data: {
                                                shopping_list_id: id,
                                                purchased_by_person_id: me.person_id,
                                                budget_entry_id: data.budget_entry_id
                                            },
                                            success: function () {
                                                //Removes all bought items from shoppinglist
                                                for (var i = 0; i < e.length; i++) {
                                                    $("div[data-id=" + id + "]").find('li[data-id=' + e[i] + ']').remove();
                                                }
                                                //Closes popup
                                                $(".pop").remove();
                                            },
                                            error: console.error
                                        });
                                    }
                                },
                                error: console.error
                            });
                        }

                    }
                });
            }
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
    var h = "";
    for(var i = 0; i < users.length; i++){
        h += '<li class="list-group-item">' + users[i].name + '</li>';
    }
    $(".memberlist").html(h);
}
function updateList2(){
    var h = "";
    for(var i = 0; i < users.length; i++){
        h += buyers.forename + " " + buyers.lastname.charAt(0).toUpperCase() + ".,";
    }
    $(".users-entry").html(h);
}
