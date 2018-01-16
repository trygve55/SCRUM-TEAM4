var lang;
var users = [];

$('document').ready(function () {

    //-----------Language-----------
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

    //-----------Lists-----------
    var count = 0;
    $('#addlist').click(function () {
        count++;
        $("<div class=\"col-sm liste\" id='listenr"+count+"'><div class='row'>" +
            "<div class='col-sm-7' style='text-align: left' id='listnamediv'>" +
            "<div id='listname"+count+"' style='margin: 6px'><input type='text' class='form-control' id='listnameinput"+count+"'></div>" +
            "<div id='nameforlist"+count+"'><h4>Liste"+count+"</h4></div></div>"+
            "<div class='col-sm-5' style='text-align: right'>" +
            "    <h4><i class=\"fa fa-circle\" aria-hidden=\"true\" style='color: white; text-shadow: 0px 0px 3px #000;' id='whitebutt"+count+"'></i>" +
            "        <i class=\"fa fa-circle\" aria-hidden=\"true\" style='color: lightpink; text-shadow: 0px 0px 3px #000;' id='pinkbutt"+count+"'></i> " +
            "        <i class=\"fa fa-circle\" aria-hidden=\"true\" style='color: #ffec8e; text-shadow: 0px 0px 3px #000;' id='yellowbutt"+count+"'></i> " +
            "        <i class=\"fa fa-circle\" aria-hidden=\"true\" style='color: lightgreen; text-shadow: 0px 0px 3px #000;' id='greenbutt"+count+"'></i></h4></div>" +
            "</div>" +
            "<ul class=\"list-group listsss\" id=\"itemlist"+count+"\"></ul>"+
            "<ul class=\"list-group\">"+
            "<div class=\"inpi\" id=\"inputitem"+count+"\"><li class=\"list-group-item\" id=\"listitem"+count+"\">" +
            "<input type=\"text\" class=\"form-control ni\" id=\"newitem"+count+"\">" +
            "</li></div><li class=\"list-group-item addi\" id=\"additem"+count+"\"><i class=\"fa fa-plus-circle\" aria-hidden=\"true\"></i> Add item</li>" +
            "</ul><i class='fa fa-check-circle-o' aria-hidden='true' style='font-size: 20px' id='donebutton"+count+"'> "+lang["tasks-done"]+"</i><i class=\"fa fa-users\" aria-hidden=\"true\" style='font-size: 20px' id='sharebutton"+count+"'> "+lang["tasks-share"]+"</i>" +
            "<div id='sharediv"+count+"'><input type=\"text\" class=\"form-control ni\" id=\"shareinput"+count+"\"></div>"+
            "</div>"+

            "<div class=\"messagepop pop\" id=\"tasks-popup\">" +
            "   <p align=\"center\" style=\"font-size: 20px\">"+lang["tasks-addmemberstolist"]+"</p>" +
            "   <ul class=\"list-group\" id='tasks-memberslist"+count+"' style='margin-top: 10px; margin-bottom: 10px; max-height: 30vh;'></ul>"+
            "   <div class=\"row\">" +
            "      <div class=\"col-md-8\" id=\"scrollable-dropdown-menu\"><input class=\"typeahead form-control\" id=\"tasks-member"+count+"\"></div>" +
            "      <div class=\"col-md-1'\"><button type=\"button\" class=\"btn btn-info\" id=\"tasks-adduser"+count+"\">"+lang["tasks-adduser"]+"</button></div>" +
            "   </div>" +
            "   <div style=\"margin-top: 5%\"><button align=\"right\" type=\"button\" class=\"btn\" id=\"tasks-cancel"+count+"\" style=\"background-color: lightgrey\">"+lang["tasks-cancel"]+"</button></div>" +
            "</div>").insertAfter("#addlist");
        $('#listname'+count).hide();
        $('#inputitem'+count).hide();
        $('#dialog'+count).hide();
        $('#sharediv'+count).hide();

        //---------Opens inputfield to change listname--------
        $('#nameforlist'+count).click(function(){
            var navn = this.id;
            var ide = navn.split("t").pop();
            console.log(ide + " name for list clicked");
            $('#nameforlist'+ide).hide();
            $('#listname'+ide).show();
            $('#listnameinput'+ide).focus();
        });

        //---------Edits listname when enter is pressed-------
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

        //---------Changes the background-colors when circles are clicked-------
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

        //---------Opens inputfield for adding listitems-------
        $('#additem'+count).click(function () {
            var name = this.id;
            var ide = name.split("m").pop(); //listeid

            $('#additem'+ide).hide();
            $('#inputitem'+ide).show();
            $('#newitem'+ide).focus();
        });

        //---------Adds item to list when Enter is pressed----
        var itemcount = 0;
        $('#newitem'+count).keypress(function(event) {
            if (event.keyCode == 13 || event.which == 13) {
                itemcount++;

                var navn = this.id;
                var ide = navn.split("m").pop(); //Id of list
                var item = $('#newitem'+ide).val(); //Value of inputfield

                $('#newitem'+ide).val('');//Resets inputfield
                //----------Adds item--------
                $('#itemlist'+ide).append("" +
                    "<li class=\"list-group-item\" id=\"elem"+count+itemcount+"\" style='padding: -2px; margin: -3px'>" +
                    "   <div class='row'>" +
                    "       <div class=\"checkbox col-sm\"> " +
                    "           <label id='labelitem"+count+itemcount+"'>" +
                    "           <input class='checkboxx' type=\"checkbox\" id='checkbox"+count+itemcount+"'> "+item+"</div>" +
                    "       <div class='col-sm' style='text-align: right'>" +
                    "           <i class=\"fa fa-times\" aria-hidden=\"true\" id=\"crossout" +count+"-"+ itemcount + "\" style='font-size: 25px;'></i></label> " +
                    "   </div></div>" +
                    "   <div class='row'>" +
                    "       <div class='col-sm assign' style='font-style: italic; text-decoration: underline;' id='assign"+count+'-'+itemcount+"'> " +
                    "           <div id='namee"+count+itemcount+"'>Assign</div> " +
                    "           <div id='divassignedto"+count+"-"+itemcount+"'>" +
                    "               <input type='text' class='form-control' id='assignedto"+count+"-"+itemcount+"'>" +
                    "   </div></div>" +
                    "<div class='col-sm' style='text-align: right'><div class='assign' id='dueto"+count+"-"+itemcount+"' style='font-style: italic; text-decoration: underline;'>Due date</div>" +
                    "<div id='divduetoinput"+count+"-"+itemcount+"'>" +
                    "<input type='text' class='form-control' id='duetoinput"+count+"-"+itemcount+"'></div></div>" +
                    "</div>"+
                    "</li>");
                $('#divassignedto'+count+"-"+itemcount).hide();
                $('#divduetoinput'+count+"-"+itemcount).hide();

                //----------Deletes item-----------------------------
                $('#crossout'+count+'-'+itemcount).click(function () {
                    var name = this.id;
                    var numbers = name.split("t").pop(); //listeid
                    var thiscount =  numbers.split("-")[0];
                    var thisitemcount = numbers.split("-")[1];
                    var theelement = "elem"+thiscount+thisitemcount;
                    document.getElementById(theelement).remove();
                    itemcount--;
                });

                //----------Opens inputfield for assigned to----------
                $('#assign'+count+'-'+itemcount).click(function () {
                    var name = this.id;
                    var thiscount = name.split("n").pop().split("-")[0];
                    var thisitemcount = name.split("n").pop().split("-")[1];
                    $('#divassignedto'+thiscount+"-"+thisitemcount).show();
                    $('#assignedto'+thiscount+"-"+thisitemcount).focus();
                });

                //----------Sets assigned-to when Enter is clicked----
                $('#assignedto'+count+"-"+itemcount).keypress(function (event) {
                    if (event.keyCode == 13 || event.which == 13) {
                        var name = this.id;
                        var thiscount = name.split("o").pop().split("-")[0];
                        var thisitemcount = name.split("o").pop().split("-")[1];
                        var name = $('#assignedto'+thiscount+'-'+thisitemcount).val();
                        $('#namee'+thiscount+thisitemcount).html("Assigned to: " + name);
                        $('#divassignedto'+thiscount+'-'+thisitemcount).hide();
                    }
                });

                //----------Opens inputfield for due to----------
                $('#dueto'+count+'-'+itemcount).click(function () {
                    var name = this.id;
                    var thiscount = name.split("o").pop().split("-")[0];
                    var thisitemcount = name.split("o").pop().split("-")[1];
                    $('#divduetoinput'+thiscount+"-"+thisitemcount).show();
                    $('#duetoinput'+thiscount+"-"+thisitemcount).focus();
                });

                //----------Sets due-to when Enter is clicked----
                $('#duetoinput'+count+"-"+itemcount).keypress(function (event) {
                    if (event.keyCode == 13 || event.which == 13) {
                        var name = this.id;
                        var thiscount = name.split("t").pop().split("-")[0];
                        var thisitemcount = name.split("t").pop().split("-")[1];
                        var date = $('#duetoinput'+thiscount+'-'+thisitemcount).val();
                        $('#dueto'+thiscount+'-'+thisitemcount).html("Due to: " + date);
                        $('#divduetoinput'+thiscount+'-'+thisitemcount).hide();
                    }
                });
            }
        });

        //-----------Hide inputfield when focus goes out-----
        $("#newitem"+count).focusout(function () {
            var navn = this.id;
            var ide = navn.split("m").pop(); //listeid
            $('#additem'+ide).show();
            $('#inputitem'+ide).hide();
        });

        //-----------Adds all checked items to a table and removes them from the list---------
        $("#donebutton"+count).click(function () {
            var table = [];
            var navn = this.id;
            var ide = navn.split("n").pop(); //listeid
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
                //console.log(table[t]);
            }
        });

        //--------------POPUP Share list-----------------
        function deselect(e) {
            $('.pop').slideFadeToggle(function() {
                e.removeClass('selected');
            });
        }
        $('#sharebutton'+count).on('click', function() {
            $(this).addClass('selected');
            $('.pop').slideFadeToggle();
        });

        $('#tasks-cancel'+count).on('click', function() {
            deselect($('#contact'));
        });
        $.fn.slideFadeToggle = function(easing, callback) {
            return this.animate({ opacity: 'toggle', height: 'toggle' }, 'fast', easing, callback);
        };

        //--------------POPUP Share list - Userlist-------
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
        $('#tasks-member'+count).keypress(function(event) {
            if(event.keyCode == 13 || event.which == 13){
                var navn = this.id;
                var ide = navn.split("r").pop(); //listeid
                addmember(ide);
            }
        });
        $('#tasks-adduser'+count).click(function(){
            var navn = this.id;
            var ide = navn.split("r").pop(); //listeid
            addmember(ide);
        });
        function addmember(ide){
            var member = $('#tasks-member'+ide).val();
            $('#tasks-memberslist'+ide).prepend('<li class="list-group-item">'+member+'</li>');
            $('#tasks-member'+ide).val('');
        }
    });

});