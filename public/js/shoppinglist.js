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
            }
        });
    });




    function inits(){
        $('.inpi').hide();
        //$('#more').hide();

    }
    $('#addlist').click(function () {

        count++;
        $("<div class=\"col-sm liste\" id='listenr"+count+"'><div class='row'>" +
            "<div class='col-sm-7' style='text-align: left'><h4>Liste "+count+"</h4></div>"+
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
            "</ul><br><button type=\"button\" class=\"btn btn-light\">Buy selected items</button></div>").insertAfter("#addlist");
        $('#inputitem'+count).hide();
        var itemcount = 0;

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
            //Add item in input if input is visible
            if($('#inputitem'+ide).is(":visible")){
                itemcount++;
                var item = $('#newitem'+ide).val();
                $('#newitem'+ide).val('');
                $('#itemlist'+ide).append("<li class=\"list-group-item\" id=\"elem"+itemcount+"\"><div class='row'><div class=\"checkbox col-sm\"> <label><input type=\"checkbox\"> "+item+"</div><div class='col-sm' style='text-align: right'><i class=\"fa fa-times\" aria-hidden=\"true\" id=\"crossout" + itemcount + "\"></i></label> </div></div></li>");
                $('#inputitem'+ide).hide();
                console.log("Itemcount: " + itemcount + " on count " + ide);

                $('#crossout'+itemcount).click(function () {
                    var iden = "elem"+itemcount;
                    document.getElementById(iden).remove();
                    itemcount--;
                });
            }

            $('#inputitem'+ide).show();
        });
        $('#newitem'+count).keypress(function(event) {
            if (event.keyCode == 13 || event.which == 13) {
                itemcount++;
                var navn = this.id;
                var ide = navn.split("m").pop(); //listeid

                $('#inputitem'+ide).hide();
                var item = $('#newitem'+ide).val();
                $('#newitem'+ide).val('');
                $('#itemlist'+ide).append("<li class=\"list-group-item\" id=\"elem"+itemcount+"\"><div class='row'><div class=\"checkbox col-sm\"> <label><input type=\"checkbox\"> "+item+"</div><div class='col-sm' style='text-align: right'><i class=\"fa fa-times\" aria-hidden=\"true\" id=\"crossout" + itemcount + "\"></i></label> </div></div></li>");
                console.log("Itemcount: " + itemcount + " on count " + ide);

                $('#crossout'+itemcount).click(function () {
                    var iden = "elem"+itemcount;
                    document.getElementById(iden).remove();
                    itemcount--;
                });
                $('#additem'+ide).show();
            }
        });

    });

});
