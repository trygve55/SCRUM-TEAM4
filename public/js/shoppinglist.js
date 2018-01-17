var lang;
var users = [];
var list, balance, listItem, newListItem;

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
                "listItem.html",
                "newListItem.html"
            ]
        },
        success: function(data){
            list = Handlebars.compile(data["list.html"]);
            balance = Handlebars.compile(data["balance.html"]);
            listItem = Handlebars.compile(data["listItem.html"]);
            newListItem = Handlebars.compile(data["newListItem.html"]);
            prep();
        }
    });
});

function prep(){
    $.ajax({
        url: '/api/shoppingList/',
        method: 'GET',
        success: function(data){
            console.log(data);
            for(var j = 0; j < data.length; j++) {
                var d = data[j];
                var entries = "";
                for (var i = 0; i < d.shopping_list_entries.length; i++) {
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
                        var entries = "";
                        for(var i = 0; i < data.shopping_list_entries.length; i++){
                            entries += listItem({entry_text: data.shopping_list_entries[i].entry_text});
                        }
                        $("#addlist").after(list({
                            shopping_list_id: data.shopping_list_id,
                            shopping_list_name: data.shopping_list_name,
                            shopping_list_entries: entries,
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

        //-----------------Press add item button opens inputfield--------------
        $('#additem'+count).click(function () {
            var navn = this.id;
            var ide = navn.split("m").pop(); //listeid
            $('#additem'+ide).hide();
            $('#inputitem'+ide).show();
            $('#newitem'+ide).focus();

        });

        //-----------------Adds item when Enter is pressed---------------------
        $('#newitem'+count).keypress(function(event) {
            if (event.keyCode == 13 || event.which == 13) {
                itemcount++;
                var navn = this.id;
                var ide = navn.split("m").pop(); //listeid

                //$('#inputitem'+ide).hide();
                var item = $('#newitem'+ide).val();
                $('#newitem'+ide).val('');
                $('#itemlist'+ide).append("<li class=\"list-group-item\" id=\"elem"+count+itemcount+"\"><div class='row'><div class=\"checkbox col-sm\"> <label id='labelitem"+count+itemcount+"'><input class='checkboxx' type=\"checkbox\" id='checkbox"+count+itemcount+"'> "+item+"</div><div class='col-sm' style='text-align: right'><i class=\"fa fa-times\" aria-hidden=\"true\" id=\"crossout" +count+'-'+ itemcount + "\"></i></label> </div></div></li>");

                $('#crossout'+count+'-'+itemcount).click(function () {
                    var name = this.id;
                    var numbers = name.split("t").pop(); //listeid
                    var thiscount =  numbers.split("-")[0];
                    var thisitemcount = numbers.split("-")[1];
                    var theelement = "elem"+thiscount+thisitemcount;
                    document.getElementById(theelement).remove();
                    itemcount--;
                });
            }
        });

        //-------------------Removes inputfield when focus is out----------------
        $("#newitem"+count).focusout(function () {
            var navn = this.id;
            var ide = navn.split("m").pop(); //listeid
            $('#additem'+ide).show();
            $('#inputitem'+ide).hide();
        });

        //-------------------Removes items from list when checked and shoppingcart is clicked----------
        $("#shoppingcart"+count).click(function () {
            var table = [];
            var navn = this.id;
            var ide = navn.split("t").pop(); //listeid
            $(".checkboxx").each(function () {
                if($(this).is(':checked')){
                    var numb = this.id;
                    var nr = numb.split("x").pop();
                    var ss = nr[1];
                    var htmllab = $('#labelitem'+ide+ss).html();
                    var item = htmllab.split(">").pop();
                    table.push(item);
                    document.getElementById('elem'+ide+ss).remove();
                }
            });
            for(t in table){
                console.log(table[t]);
            }
        });

        //-------------------Deletes the list------------------------
        $("#shop-delete"+count).click(function () {

            var navn = this.id;
            var ide = navn.split("e").pop();
            $("#shop-delete"+ide).html(" Press again to delete");
            $("#shop-delete"+count).click(function () {
                $('#listenr'+ide).remove();
            });
        });

        //-------------------Goes to balance list--------------------
        $('#shop-balance'+count).click(function() {
            var navn = this.id;
            var ide = navn.split("e").pop();
            $('#listenr'+ide).hide();
            $('#balancediv'+ide).show();

            //-------------------Goes back to shoppinglist---------------
            $('#shop-backlist'+count).click(function () {
                var navn = this.id;
                var ide = navn.split("t").pop();
                $('#listenr'+ide).show();
                $('#balancediv'+ide).hide();
            });

        });

        //-----------------Opens member popup--------------------

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

        $('#shop-adduser'+count).click(function(){
            var navn = this.id;
            var ide = navn.split("r").pop(); //listeid
            addmember(ide);
        });*/
    });
}

function setupClicks(){
    $(".list-name").click(function(){
        var listId = $(this).closest("div[data-id]").data("id");
        var title = $(this).html();
        $(this).hide();
        var div = $(this).parent().children(".list-name-div");
        $(div).show();
        $(div).children(".list-name-input").val(title).focus();
    });

    $(".list-name-input").focusout(function(){
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

    $(".list-name-input").keypress(function(e){
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

    $(".add-item").click(function(){
        $(this).closest("div").children(".itemlist").append(newListItem());

        $("#new-list-item").keypress(function(e){
            if(e.keyCode != 13 && e.which != 13)
                return;
            var ul = $(this).closest("ul");
            var text = $(this).val();
            if(text != "") {
                saveItemToDB($(this).closest("div[data-id]").data("id"), text);
                $(ul).append(listItem({entry_text: text}));
                $(this).closest("li").remove();
                addNewItem(ul);
            }
            else
                $(this).closest("li").remove();
        }).focusout(function(){
            console.log("hei");
            var ul = $(this).closest("ul");
            var text = $(this).val();
            if(text != "") {
                saveItemToDB($(this).closest("div[data-id]").data("id"), text);
                $(ul).append(listItem({entry_text: text}));
            }
            $(this).closest("li").remove();
        }).focus();
    });

    $('.pink-select').click(function () {
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

    $('.yellow-select').click(function () {
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

    $('.green-select').click(function () {
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

    $('.white-select').click(function () {
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
}

function addNewItem(ul){
    $(ul).append(newListItem());
    console.log("hei");
    $("#new-list-item").keypress(function(e){
        if(e.keyCode != 13 && e.which != 13)
            return;
        var ul = $(this).closest("ul");
        var text = $(this).val();
        if(text != "") {
            saveItemToDB($(this).closest("div[data-id]").data("id"), text);
            $(ul).append(listItem({entry_text: text}));
            $(this).closest("li").remove();
            addNewItem(ul);
        }
        else
            $(this).closest("li").remove();
    }).focusout(function(){
        console.log("hei");
        var ul = $(this).closest("ul");
        var text = $(this).val();
        if(text != "") {
            saveItemToDB($(this).closest("div[data-id]").data("id"), text);
            $(ul).append(listItem({entry_text: text}));
        }
        $(this).closest("li").remove();
    }).focus();
}

function saveItemToDB(id, item){
    $.ajax({
        url: '/api/shoppingList/entry',
        method: 'POST',
        data: {
            shopping_list_id: id,
            entry_text: item
        }
    });
}

function addmember(ide){
    var member = $('#shop-member'+ide).val();
    $('#shop-memberslist'+ide).prepend('<li class="list-group-item">'+member+'</li>');
    $('#shop-member'+ide).val('');
}

function deselect(e) {
    $('.pop').slideFadeToggle(function() {
        e.removeClass('selected');
    });
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