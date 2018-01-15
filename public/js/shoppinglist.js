$('document').ready(function (){



    var count = 0;
    inits();
    $.ajax({
        url: '/api/language',
        method: 'GET',
        data: {
            lang: 'nb_NO',
            path: window.location.pathname
        },
        success: function (data) {
            for (var p in data) {
                if (data.hasOwnProperty(p)) {
                    $("#" + p).html(data[p]);
                }
            }
            $("#shoppingcart").attr('title', data["shoppingcart"]);
        }
    });


    $('#login-norway').click(function () {
        $.ajax({
            url: '/api/language',
            method: 'GET',
            data: {
                lang: 'nb_NO',
                path: window.location.pathname
            },
            success: function (data) {
                for (var p in data) {
                    if (data.hasOwnProperty(p)) {
                        $("#" + p).html(data[p]);
                    }
                }
                $("#shoppingcart").attr('title', data["shoppingcart"]);
            }
        });
    });

    $('#login-england').click(function () {
        $.ajax({
            url: '/api/language',
            method: 'GET',
            data: {
                lang: 'en_US',
                path: window.location.pathname
            },
            success: function (data) {
                for (var p in data) {
                    if (data.hasOwnProperty(p)) {
                        $("#" + p).html(data[p]);
                    }
                }
                $("#shoppingcart").attr('title', data["shoppingcart"]);
            }
        });
    });




    function inits(){
        $('.inpi').hide();

    }
    $('#addlist').click(function () {

        count++;
        $("<div class=\"col-sm liste\" id='listenr"+count+"'><div class='row'>" +
            "<div class='col-sm-7' style='text-align: left'>" +
            "<div id='listname"+count+"' style='margin: 6px'><input type='text' class='form-control ni' id='listnameinput"+count+"'></div>" +
            "<div id='nameforlist"+count+"'<h4>Liste"+count+"</h4></div></div>"+
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
            "</li></div><li class=\"list-group-item addi\" id=\"additem"+count+"\"><i class=\"fa fa-plus-circle\" aria-hidden=\"true\"></i> Add item</li>" +
            "</ul><i class=\"fa fa-shopping-cart\" aria-hidden=\"true\" id='shoppingcart"+count+"' style='font-size: 20px'> Buy</i><i class=\"fa fa-users\" aria-hidden=\"true\" style='font-size: 20px'> Share</i></div>").insertAfter("#addlist");
        $('#inputitem'+count).hide();
        $('#listname'+count).hide();
        var itemcount = 0;

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

        $('#additem'+count).click(function () {
            var navn = this.id;
            var ide = navn.split("m").pop(); //listeid
            $('#additem'+ide).hide();
            $('#inputitem'+ide).show();
            $('#newitem'+ide).focus();

        });
        $('#newitem'+count).keypress(function(event) {
            if (event.keyCode == 13 || event.which == 13) {
                itemcount++;
                var navn = this.id;
                var ide = navn.split("m").pop(); //listeid

                //$('#inputitem'+ide).hide();
                var item = $('#newitem'+ide).val();
                $('#newitem'+ide).val('');
                $('#itemlist'+ide).append("<li class=\"list-group-item\" id=\"elem"+count+itemcount+"\"><div class='row'><div class=\"checkbox col-sm\"> <label id='labelitem"+count+itemcount+"'><input class='checkboxx' type=\"checkbox\" id='checkbox"+count+itemcount+"'> "+item+"</div><div class='col-sm' style='text-align: right'><i class=\"fa fa-times\" aria-hidden=\"true\" id=\"crossout" + itemcount + "\"></i></label> </div></div></li>");

                $('#crossout'+itemcount).click(function () {
                    var iden = "elem"+ide+itemcount;
                    document.getElementById(iden).remove();
                    itemcount--;
                });
            }
        });
        $("#newitem"+count).focusout(function () {
            var navn = this.id;
            var ide = navn.split("m").pop(); //listeid
            $('#additem'+ide).show();
            $('#inputitem'+ide).hide();
        });
        $("#shoppingcart").attr('title', 'Buy selected items');

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

    });

});
