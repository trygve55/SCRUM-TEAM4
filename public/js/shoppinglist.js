var lang;
var users = [];
var lists = [];
var newmembers = [];
var curBudget, currencies;
var list, balance, listItem, newListItem, popupTextList, popupList, balanceItem, listReplace, popupMembers, newlabel, popupSettle, popupLabel;
var settleAll;
var me;
var generalLabels;
var thenewlabel, byersSelect, byersAll;
var buyers = [];

jQuery.ajaxSettings.traditional = true;

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
            me = data[0];
        }
    });

    //------------------Setting a variable to all currencies in the database------------


    /**
     * This method retrieves information the set currency for a shoppinglist.
     */

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

    /**
     * This method calls the language api and sets the language to norwegian
     * if the user clicks on the norwegian flag.
     */
    $('#shop-norway').click(function () {
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

    /**
     * This method calls the language api and sets the language to english
     * if the user clicks on the british flag.
     */
    $('#shop-england').click(function () {
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

    /**
     * This method retrieves the templates and lets us use them.
     */

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
                "newlabel.html",
                "popupSettle.html",
                "popupLabel.html",
                "settleAll.html"
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
            popupSettle = Handlebars.compile(data["popupSettle.html"]);
            popupLabel = Handlebars.compile(data["popupLabel.html"]);
            settleAll = Handlebars.compile(data["settleAll.html"]);
            prep();
        }
    });
});

function prep(){

    //-----------------Gets all shoppinglists and shows them in the website------------

    /**
     * This method retrieves all shopping lists on the database and sets them up when
     * the user foes into the shoppinglist site.
     */

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
            setupItemClicks();
        }
    });

    //---------------New list-------------



    /**
     * This function makes it possible for a user to add a new shoppinglist. Posts the users
     * input into the database.
     */

    $('#addlist').click(function () {
        console.log("new list clicked");

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
                            lang_currency: currencies,
                            lang_share_members: lang["shop-share"],
                            lang_delete_list: lang["shop-delete"],
                            lang_settlement: lang["shop-balance"],
                            color_hex: (data.color_hex ? data.color_hex.toString(16) : "FFFFFF")
                        }));
                        setupClicks();
                        var thisdiv = $('div[data-id=' + data.shopping_list_id + ']');
                        thisdiv.find("select").val(data.currency_id);

                        var titlediv = thisdiv.find('.list-name');
                        var title = titlediv.html();
                        $(titlediv).hide();
                        var div = thisdiv.find(".list-name-div");
                        $(div).show();
                        $(div).children(".list-name-input").val(title).focus();

                        setupClicks();
                        setupItemClicks();
                    }
                });
            }
        });
    });
}

//-----------------Sets up the buttons so the functionality will work------------


/**
 * This function
 */

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
        $('.label-select').unbind("click").click(function(){
            var li = $(this).closest('div[data-id]').data("id");
            $.ajax({
                url: '/api/budget/entryType',
                method: 'GET',
                data: {
                    shopping_list_id: li
                },
                success: function (data) {
                    var tll = '<li class="list-group-item list-group-item-action activ newlabel" id=-1>'+lang["lang-new-label"]+'</li>';
                    for(var i=data.budget_entry_types.length-1; i>=0; i--){
                        var color = Number(data.budget_entry_types[i].entry_type_color).toString(16);
                        tll += '<li style="background-color: #'+color+'; color: black" class="list-group-item list-group-item-action" id='+data.budget_entry_types[i].budget_entry_type_id+'>'+data.budget_entry_types[i].entry_type_name+'</li>';
                    }
                    $('body').append(popupLabel({
                        label_headline: lang["label-headline"],
                        the_label_list: tll,
                        label_goback: lang["label-goback"],
                        lang_new_label: lang["lang-new-label"],
                        lang_new_label_name: lang["lang-new-label-name"],
                        lang_new_label_color: lang["lang-new-label-color"],
                        lang_new_label_add: lang["lang-new-label-add"],
                        lang_new_label_reset: lang["lang-new-label-reset"],
                        lang_edit_label: lang["lang-edit-label"],
                        lang_update_label_update: lang["lang-update-label-update"],
                        lang_update_label_delete: lang["lang-update-label-delete"],

                    }));

                    var currColor = "#a9d5f2";
                    $(".colorpicker").spectrum({
                        color: "#a9d5f2",
                        change: function(color){
                            currColor = color.toHexString();
                            console.log(currColor);
                        }
                    });
                    $('.labeledit').hide();
                    $('.labelgoback').unbind("click").click(function () {
                        $('.pop').remove();
                    });
                    
                    var thedata = data;
                    setTableClicks(data);
                    $('.add').unbind("click").click(function (){
                        if($('#label-name-input').val()=="") return;
                        var thenewcolor = currColor;
                        console.log(thenewcolor);
                        var newcolorhash = currColor.split("#")[1];
                        var newtext = $('#label-name-input').val();
                        var newcolorInt = Number(parseInt(newcolorhash, 16));

                        $.ajax({
                            url: '/api/budget/entryType',
                            method: 'POST',
                            data: {
                                entry_type_name: newtext,
                                entry_type_color: newcolorInt,
                                shopping_list_id: li
                            },
                            success: function(data){
                                $('li.newlabel').after('<li style="background-color: '+thenewcolor+'; color: black" class="list-group-item list-group-item-action" id='+data.budget_entry_type_id+'>'+newtext+'</li>');
                                colorRefresh();
                                setTableClicks(thedata);
                                $('#label-name-input').val('');
                                $(".colorpicker").spectrum({
                                        color: "#a9d5f2",
                                        change: function(color){
                                            currColor = color.toHexString();
                                            console.log(currColor);
                                        }
                                });
                            },
                            error: console.error
                        });
                    });
                    $('.deletelabel').unbind("click").click(function (){
                        var labelid = $('li.activ').attr('id');
                        console.log(labelid);
                        $.ajax({
                            url: '/api/budget/entryType/'+labelid,
                            method: 'DELETE',
                            success: function () {
                                console.log("success deleting");
                                $('li.activ').remove();
                                $('li').removeClass("activ");
                                $('li.newlabel').addClass("activ");
                                $('.labeledit').hide();
                                $('.labelnew').show();
                                $(".colorpicker").spectrum({
                                    color: "#a9d5f2"
                                });
                            },
                            error: console.error
                        });
                    });
                    $('.updatelabel').unbind("click").click(function (){
                        var newcolorhash = currColor.split("#")[1];
                        var newtext = $('#label-edit-input').val();
                        var labelid = $('li.activ').attr('id');
                        var newcolorInt = Number(parseInt(newcolorhash, 16));
                        $.ajax({
                            url: '/api/budget/entryType/'+labelid,
                            method: 'PUT',
                            data:{
                                entry_type_name: newtext,
                                entry_type_color: newcolorInt
                            },
                            success: function(data){
                                $('li.activ').text(newtext);
                                setTableClicks(thedata);

                            },
                            error: console.error
                        })
                    });
                    $('.reset').unbind("click").click(function () {
                        $('#label-name-input').val('');
                        $(".colorpicker").spectrum({
                            color: "#a9d5f2",
                            change: function(color){
                                currColor = color.toHexString();
                                console.log(currColor);
                            }
                        });
                    });
                }
            });
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
            memb_cancel: lang["memb_cancel"],
            memb_complete: lang["memb_complete"],
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
                    prefetch: {
                        url: '/api/user/all?slim=1',
                        cache: false
                    }
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
            users=[];
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
            users=[];
        });
    });


    /**
     * This method opens settlement box when money-button is clicked.
     */
    $(".fa-money").unbind("click").click(function(){
        var id = $(this).closest("div[data-id]").data("id");
        var sign = "";
        var place = -1;
        for(var j=0; j<lists.length; j++){
            if(lists[j].shopping_list_id==id){
                sign = lists[j].currency_sign;
                place=j;
            }
        }
        var mbutton = this;
        $.ajax({
            url: '/api/budget/' + id,
            method: 'GET',
            success: function(data){
                curBudget = data;
                var entries = "";

                /**
                 * This method adds all budget-entries to the list
                 */
                for(var i = data.budget.length-1; i >= 0 ; i--){
                    entries += "<tr data-id='" + data.budget[i].budget_entry_id + "'><td>" + data.budget[i].text_note +"</td><td>" + data.budget[i].amount/100 + " "+sign+"</td>";
                }


                var oeM = '';
                var oeB = '';
                var balancelist = curBudget.my_balance;

                for(var i=0; i<balancelist.length; i++){
                    var name = balancelist[i].forename + " " + balancelist[i].lastname;
                    var numb = balancelist[i].amount/100;
                    if(numb < 0){
                        oeM += "<tr  class='balancelist minus'><td>" + name +"</td><td>" + numb + " "+sign+"</td>";
                    }else{
                        oeB += "<tr class='balancelist plus'><td>" + name +"</td><td>" + numb + " "+sign+"</td>";
                    }
                }
                var oe = oeM + oeB;

                $(mbutton).closest("div[data-id]").html(balance({
                    title: lang["shop-balance"],
                    bal_complete: lang["bal-ok"],
                    lang_trip: lang["shop-trip"],
                    lang_price: lang["shop-price"],
                    lang_name: lang["lang-name"],
                    lang_owe: lang["lang-owe"],
                    owe_entries: oe,
                    lang_settle: lang["lang-settle"],
                    budget_entries: entries
                }));


                $('.balancelist').unbind("click").click(function () {
                    var name = this.innerHTML.split('>')[1].split('<')[0];
                    for(var j=0; j<balancelist.length; j++){
                        var thefullname = balancelist[j].forename + " " + balancelist[j].lastname;
                        var personid = balancelist[j].person_id;
                        if(thefullname == name){
                            if(balancelist[j].amount <= 0) {
                                break;
                            }
                            var thelist = balancelist[j];
                            var budgetids = thelist.budget_entry_ids;
                            console.log(budgetids);
                            var arr = thelist.budget_entry_ids;
                            st = lang["settle-text-one"] + thefullname + lang["settle-text-two"] + this.innerHTML.split(">")[3].split("<")[0].replace("-", "");
                            $('body').append(popupSettle({
                                settle_text: st,
                                settle_yes: lang["settle-yes"],
                                settle_no: lang["settle-no"]
                            }));
                            var arrayString = arr.join(",");
                            console.log(arr);
                            console.log(arrayString);
                            $('.btn-success').unbind("click").click(function () {
                                var suc = this;
                                $.ajax({
                                    url: 'api/budget/pay',
                                    method: 'PUT',
                                    contentType: 'application/json',
                                    data: JSON.stringify({
                                        budget_entry_ids: arrayString,
                                        person_id: personid
                                    }),
                                    error: console.error,
                                    success: function (data) {
                                        $(suc).closest('.pop').remove();
                                    }
                                })
                            });
                            $('.btn-danger').unbind("click").click(function () {
                                $(this).closest('.pop').remove();
                            });
                        }
                    }

                });

                /**
                 * This method opens a popup when a budget-entry is clicked.
                 */
                $('tr[data-id]').click(function(){
                    var id = $(this).closest("tr[data-id]").data("id");
                    var entry = null;
                    for(var i = 0; i < curBudget.budget.length; i++){
                        if(curBudget.budget[i].budget_entry_id == id){
                            entry = curBudget.budget[i];
                            break;
                        }
                    }
                    if(!entry)
                        return;
                    var entrylist = entry.shopping_list_entries;
                    var g = "";
                    for(var j=0; j<entrylist.length; j++){
                        g += "<li class='list-group-item'>"+entrylist[j].entry_text+"</li>";
                    }
                    var p = "";
                    var payerlist = entry.persons_to_pay;
                    for(var k=0; k<payerlist.length; k++){
                        var temp = '';
                        if(payerlist[k].datetime_paid!=null){
                            temp = '<i class="fa fa-check" aria-hidden="true"></i>';
                        }
                        if(payerlist[k].person_id == me.person_id){
                            p += "<tr><td>"+lang["me"]+"</td><td style='text-align: center'>"+temp+"</td></tr>";
                        }else{
                            p += "<tr><td>"+payerlist[k].forename+" "+payerlist[k].lastname+"</td><td>"+temp+"</td></tr>";
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
                    var la = entry.entry_type.entry_type_name;
                    var bc = Number(entry.entry_type.entry_type_color).toString(16);
                    var lh = '<div style="background-color: #'+bc+'; padding-left: 1vh; padding-top: 0.5vh; padding-bottom: 0.5vh;border-radius: 15px;">'+lang["label-label"]+': '+(la ? la : lang["label-none"])+'</div>';
                    $("body").append(balanceItem({
                        comment: entry.text_note,
                        bought_by: (entry.purchased_by.person_id == me.person_id ? lang["me"] : entry.purchased_by.forename + " " + entry.purchased_by.lastname),
                        bought_by_label: lang["bought-by-label"],
                        cost: entry.amount/100 + " " + sign,
                        cost_label: lang["cost-label"],
                        payers: p,
                        labelhtml: lh,
                        lang_payers: lang["lang-payers"],
                        lang_payed: lang["lang-payed"],
                        goods: g,
                        goods_label: lang["goods-label"],
                        time: formattedDateTime,
                        time_label: lang["time-label"],
                        shop_complete: lang["shop-complete"]
                    }));
                    $("#balance-info-complete").click(function(){
                        $(this).closest(".pop").remove();
                        $(".pop").show();
                    });
                });


                $('.bal-complete').unbind("click").click(function(){
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

    /**
     * This method deletes a list.
     */
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


    /**
     * This function makes it possible for a user to buy items. Opens a popup to fill in information
     * about the purchase.
     */
    $(".fa-shopping-cart").unbind("click").click(function(){
        var li = $(this).parent().attr("data-id");
        var mycart = this;
        var h = "";
        h += '<option value="-1">----</option>';
        h += '<option value="0">' + generalLabels[0] + '</option>';
        var labelz = [];

        /**
         * This methos opens a popup with previous bought items.
         */
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


                /**
                 * This method adds bought items to the list in the popup.
                 */
                for (var i = 1; i < items.length; i++) {
                    number++;
                    entries += "," + $(items[i]).data("id");
                    list += "<li class=\"list-group-item\">" + number + ". " + $(items[i]).text() + "</li>";
                    itemsstring[i] = $(items[i]).text().trim();
                }

                /**
                 * This method adds currency value at a cost-label.
                 * @type {string}
                 */
                var curr = "*";
                for (var i = 0; i < lists.length; i++) {
                    if (lists[i].shopping_list_id == li) {
                        curr = lists[i].currency_short;
                    }
                }
                var bye = '<option>'+lang["byers-all"]+'</option>';
                bye += '<option>'+lang["byers-select"]+'</option>';

                /**
                 * Append popup
                 */
                $("body").append(popupTextList({
                    title: lang["shop-buy-title"],
                    list: list,
                    textfield: lang["shop-buy-text"],
                    textfield_com: lang["shop-entry-name"],
                    not_needed: lang["shop-not-needed"],
                    textfield_label: lang["shop-entry-label"],
                    currency: curr,
                    advanced: lang["advanced"],
                    byers_label: lang["byers-select"],
                    byers: bye,
                    label: h,
                    cancel: lang["shop-cancel"],
                    complete: lang["shop-ok"],
                    data: "data-id='" + $(mycart).closest("div[data-id]").data("id") + "' data-entries='" + entries + "'"
                }));
                $('.addbyers').hide();
                buyers.push({
                    email: me.email,
                    id: me.person_id,
                    name: me.forename + " " + me.lastname
                });
                updateList2();
                //If 'select users' are selected in Byers
                $("#byersid").change(function () {

                    if ($("#byersid").find('option:selected').html() == byersSelect) {
                        $('.addbyers').show();
                        /**
                         * This method allows a user to search all names or emails in the database by simply
                         * entering a letter, optionally more, when adding more members to a group
                         */
                        console.log(li);
                        $('#scrollable-dropdown-menu2 .typeahead').typeahead({
                                highlight: true
                            },
                            {
                                name: 'user-names',
                                display: 'name',
                                source: new Bloodhound({
                                    datumTokenizer: function(d){
                                        console.log(d);
                                        return Bloodhound.tokenizers.whitespace(d.name).concat([d.email]);
                                    },
                                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                                    prefetch: {
                                        url: '/api/shoppingList/'+li+'/users',
                                        cache: false
                                    }
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

                        $(".typeahead").bind('typeahead:select', function(a, data){

                            if($.inArray(data, buyers) === -1){
                                buyers.push(data);
                                updateList2();
                            }
                        });

                        $(".typeahead").bind('typeahead:close', function(){
                            $(".typeahead").val("");
                        });

                    }
                    if($("#byersid").find('option:selected').html() == byersAll){
                        $('.addbyers').hide();

                    }
                });

                /**
                 * Incase labelscrolldown changes value
                 */

                $("#labelid").change(function () {

                    /**
                     * If new label is selected
                     */
                    if ($("#labelid").find('option:selected').html() == thenewlabel) {
                        $('.labelrow').after(newlabel({
                            "new_label_color": lang["new-label-color"],
                            "new_label_name": lang["new-label-name"]
                        }));


                        $('#newlabelinput').focus();
                    } else {
                        /**
                         * If others are selected an newlabelinput is showing
                         */
                        if ($('#new-label').length) {
                            $('#new-label').remove();
                        }
                    }

                    /**
                     * If focus goes out from newlabelinput, it turnes red.
                     */
                    $('#newlabelinput').focusout(function () {
                        if ($('#newlabelinput').val() == "") {
                            $('#newlabelinput').addClass("is-invalid");
                        }
                    });

                    /**
                     * If focus foes in to newlabelinput, it removes red.
                     */
                    $('#newlabelinput').focusin(function () {
                        $('#newlabelinput').removeClass("is-invalid");
                    });
                });

                /**
                 * If cancel is pressed.
                 */
                $("#t-popup-cancel").click(function () {
                    $(this).closest(".pop").remove();
                });

                /**
                 * If OK is pressed.
                 */
                $("#t-popup-complete").click(function () {

                    /**
                     * If no value is given to the cost input, it does nothing.
                     */
                    if (isNaN(Number($(this).closest('.pop').find('input').val()))){
                        console.log("non");
                        return;
                    }

                    var id = $(this).closest("div[data-id]").data("id"); //listid
                    var e = $(this).closest("div[data-entries]").data("entries"); //entries in numbervalue
                    var theitemss = itemsstring.join(" ,");

                    var comment = $(this).closest('.pop').find('#shop-entry-name').val();
                    var textnote;
                    var theis = this;

                    /**
                     * If no comment is given, text_note is set to a string of all items bought.
                     */
                    if (comment == "") {
                        textnote = theitemss;
                    } else {
                        textnote = comment;
                    }
                    if (Number(e) !== e)
                        e = e.split(",");
                    else
                        e = [e];

                    var therealbuyers = [];
                    var therealbuyersids = [];
                    console.log(buyers);
                    if($("#byersid").find('option:selected').html() == byersSelect){
                        for (var i=0; i<buyers.length; i++){

                            therealbuyersids[i] = buyers[i].id;
                        }
                    }else{
                        console.log("byersall");

                        for (var i = 0; i < lists.length; i++) {
                            if (lists[i].shopping_list_id == li) {
                                console.log("all persons in this list" + lists[i].persons);
                                therealbuyers = lists[i].persons;
                            }
                        }
                        for (var i=0; i<therealbuyers.length; i++){
                            therealbuyersids[i] = therealbuyers[i].person_id;
                        }
                    }
                    console.log("The real byers id: " + therealbuyersids);


                    var labelid;
                    if ($(this).closest('.pop').find('.label-input').val() == -1) { //If "none" is selected

                        /**
                         * Adds new shoppinglist-entry w/o label.
                         */
                        $.ajax({
                            url: '/api/budget',
                            method: 'POST',
                            dataType : "json",
                            data: {
                                shopping_list_id: id,
                                shopping_list_entry_ids: e,
                                amount: Number($(theis).closest('.pop').find('input').val())*100,
                                text_note: textnote,
                                person_ids: therealbuyersids
                            },
                            success: function (data) {

                                /**
                                 * Sets all entries to bought
                                 */
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

                            /**
                             * The text of the selected label
                             * @type {any}
                             */
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

                                    /**
                                     * This method adds a new label to the database.
                                     */

                                    $.ajax({
                                        url: '/api/budget/entryType',
                                        method: 'POST',
                                        data: {
                                            entry_type_name: l,
                                            entry_type_color: colorlab,
                                            shopping_list_id: id
                                        },
                                        success: function (data) {

                                            /**
                                             * Sets label-id to the id of selected label
                                             */
                                            $.ajax({
                                                url: '/api/budget',
                                                method: 'POST',
                                                dataType : "json",
                                                data: {
                                                    shopping_list_id: id,
                                                    shopping_list_entry_ids: e,
                                                    budget_entry_type_id: data.budget_entry_type_id,
                                                    amount: Number($(theis).closest('.pop').find('input').val())*100,
                                                    text_note: textnote,
                                                    person_ids: therealbuyersids
                                                },
                                                success: function (data) {

                                                    /**
                                                     * Sets all items to bought
                                                     */
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
                            } else {

                                /**
                                 * If other general labels are selected. Add general label to database.
                                 */
                                $.ajax({
                                    url: '/api/budget/entryType',
                                    method: 'POST',
                                    data: {
                                        entry_type_name: selec,
                                        shopping_list_id: id
                                    },
                                    success: function (data) {

                                        /**
                                         * Sets label-id to id of the new label.
                                         */
                                        console.log(e);
                                        $.ajax({
                                            url: '/api/budget',
                                            method: 'POST',
                                            contentType : "application/json",
                                            data: JSON.stringify({
                                                shopping_list_id: id,
                                                shopping_list_entry_ids: e,
                                                budget_entry_type_id: data.budget_entry_type_id,
                                                amount: Number($(theis).closest('.pop').find('input').val())*100,
                                                text_note: textnote,
                                                person_ids: therealbuyersids
                                            }),
                                            success: function (data) {

                                                /**
                                                 * Sets all items to bought.
                                                 */
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
                        } else {

                            /**
                             * If own labels are selected; set label-id to the id of the label.
                             * @type {any}
                             */
                            labelid = $(this).closest('.pop').find('.label-input').val();
                            $.ajax({
                                url: '/api/budget',
                                method: 'POST',
                                data: {
                                    shopping_list_id: id,
                                    shopping_list_entry_ids: e,
                                    budget_entry_type_id: labelid,
                                    amount: Number($(theis).closest('.pop').find('input').val())*100,
                                    text_note: textnote,
                                    person_ids: therealbuyersids
                                },
                                success: function (data) {

                                    /**
                                     * Sets all items to bought.
                                     */
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

/**
 * This function
 */
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

/**
 * This function adds a new item to the list.
 * @param ul
 */
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

/**
 * This function saves all information about the shoppinglist to the database.
 * @param id
 * @param item
 * @param ul
 * @param cb
 */
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

function updateList(){
    var h = "";
    for(var i = 0; i < users.length; i++){
        h += '<li class="list-group-item">' + users[i].name + '</li>';
    }
    $(".memberlist").html(h);
}
function updateList2(){
    var h = "";
    for(var i = buyers.length-1; i > 0; i--){
        var numb = i+1;
        h += "<p class='entrybuyername' style='font-size: small' id='"+ buyers[i].id + "'>"+numb+". "+ buyers[i].name+"</p>";
    }
    h += "<p class='entrybuyername' style='font-size: small' id='"+buyers[0].id+"'>1. "+buyers[0].name+"</p>";

    $(".users-entry").html(h);
    $(".entrybuyername").unbind("click").click(function () {
        var persId = $(this).attr("id");
        for(var i = 0; i < buyers.length; i++){
            if(buyers[i].id == persId){
                if(persId!=me.person_id) {
                    buyers.splice(i, 1);
                    $("#" + persId).remove();
                    break;
                }
            }
        }
        updateList2();
    });
}
function setTableClicks(element){
    var data = element;
    $('li.list-group-item-action').unbind("click").click(function () {
        if ($(this).attr('id') == -1) {
            $('li').removeClass("activ");
            $(this).addClass("activ");
            $('.labeledit').hide();
            $('.labelnew').show();
            currColor = "#a9d5f2";
            $(".colorpicker").spectrum({
                color: "#a9d5f2",
                change: function (color) {
                    currColor = color.toHexString();
                }
            });
        } else {
            $('li').removeClass("activ");
            $(this).addClass("activ");
            $('.labeledit').show();
            $('.labelnew').hide();

            var thisid = $(this).attr('id');
            var color = "f00";
            var noll = false;
            for (var j = 0; j < data.budget_entry_types.length; j++) {
                if (data.budget_entry_types[j].budget_entry_type_id == thisid) {
                    $('#label-edit-input').val(data.budget_entry_types[j].entry_type_name);
                    if (data.budget_entry_types[j].entry_type_color == null) {
                        noll = true;
                        currColor
                    } else {
                        color = Number(data.budget_entry_types[j].entry_type_color).toString(16);
                        currColor = Number(data.budget_entry_types[j].entry_type_color).toString(16);
                    }
                }
            }
            if (noll) {
                colortext = "#FFFFFF";
            } else {
                var colortext = "#" + color;
            }

            $(".colorpicker").spectrum({
                color: colortext,
                change: function (color) {
                    currColor = color.toHexString();
                    $('li.activ').css('background-color', currColor);
                }
            });
        }
    });
}