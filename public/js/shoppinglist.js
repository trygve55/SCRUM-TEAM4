var lang;
var users = [];
$('document').ready(function (){
    //--------------Languages------------
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
            $(".fa-money").html(" "+data["shop-balance"]);
            $(".fa-shopping-cart").html(" "+data["shop-buy"]);
            $(".fa-users").html(" "+data["shop-share"]);
            $(".fa-trash").html(" "+data["shop-delete"]);
            $(".fa-plus-circle").html(" "+data["shop-additem"]);


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
                        lang=data;
                        for (var p in data) {
                            if (data.hasOwnProperty(p)) {
                                $("#" + p).html(data[p]);
                            }
                        }
                        $(".fa-money").html(" "+data["shop-balance"]);
                        $(".fa-shopping-cart").html(" "+data["shop-buy"]);
                        $(".fa-users").html(" "+data["shop-share"]);
                        $(".fa-trash").html(" "+data["shop-delete"]);
                        $(".fa-plus-circle").html(" "+data["shop-additem"]);

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
                        lang=data;
                        for (var p in data) {
                            if (data.hasOwnProperty(p)) {
                                $("#" + p).html(data[p]);
                            }
                        }
                        $(".fa-money").html(" "+data["shop-balance"]);
                        $(".fa-shopping-cart").html(" "+data["shop-buy"]);
                        $(".fa-users").html(" "+data["shop-share"]);
                        $(".fa-trash").html(" "+data["shop-delete"]);
                        $(".fa-plus-circle").html(" "+data["shop-additem"]);
                    }
                });
            }
        });
    });


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

        });
        $('#listname'+count).keypress(function(event) {
            var navn = this.id;
            var ide = navn.split("e").pop();
            console.log(ide + " listname entered");
            if (event.keyCode == 13 || event.which == 13) {
                var name = $('#listnameinput'+ide).val();
                $('#nameforlist'+ide).show();
                $('#nameforlist'+ide).text(name);
                $('#listname'+ide).hide();
            }
        });

        //---------------------Listcolor----------------------
        $('#pinkbutt'+count).click(function () {
            var navn = this.id;
            var ide = navn.split("t").pop(); //listeid
            var name = "listenr"+ide;

            $('#'+name).removeClass("pink green white yellow");
            $('#'+name).addClass("pink");
        });
        $('#yellowbutt'+count).click(function () {
            var navn = this.id;
            var ide = navn.split("t").pop(); //listeid
            var name = "listenr"+ide;
            $('#'+name).removeClass("pink green white yellow");
            $('#'+name).addClass("yellow");
        });
        $('#greenbutt'+count).click(function () {
            var navn = this.id;
            var ide = navn.split("t").pop(); //listeid
            var name = "listenr"+ide;
            $('#'+name).removeClass("pink green white yellow");
            $('#'+name).addClass("green");
        });
        $('#whitebutt'+count).click(function () {
            var navn = this.id;
            var ide = navn.split("t").pop(); //listeid
            var name = "listenr"+ide;
            $('#'+name).removeClass("pink green white yellow");
            $('#'+name).addClass("white");
        });

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
        function deselect(e) {
            $('.pop').slideFadeToggle(function() {
                e.removeClass('selected');
            });
        }
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
        });
        function addmember(ide){
            var member = $('#shop-member'+ide).val();
            $('#shop-memberslist'+ide).prepend('<li class="list-group-item">'+member+'</li>');
            $('#shop-member'+ide).val('');
        }
    });
});
