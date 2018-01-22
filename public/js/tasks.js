var lang;
var itemcount = 0;
/*function clicked(element) {
    $(element).fadeOut(300);
    var label = element.id;
    var listnr = label.split("m").pop()[0];
    console.log($(label).find("col-sm").html());
    itemcount++;
    $('#listoftasks'+listnr).append("" +
        "<li class=\"list-group-item marked\" id=\"elem"+listnr+"-"+itemcount+"\" style='padding: -2px; margin: -3px; font-size: 15px;'>" +
        "   <div class='row'>" +
        "       <div class=\"col-sm-5\" id='theitemdiv"+listnr+"-"+itemcount+"'><i class=\"fa fa-check-circle-o\" aria-hidden=\"true\" id='checked"+listnr+"-"+itemcount+"' style='font-size: 15px;'></i>" +
        "           <i class=\"fa fa-circle-o\" aria-hidden=\"true\" id='unchecked"+listnr+"-"+itemcount+"' style='font-size: 15px;'></i> " +
        "           "+item+"</div>" +
        "       <div class='col-sm-7' style='text-align: right'>" +
        "       <input class='inputdate' type=\"text\" id=\"datepicker"+listnr+"-"+itemcount+"\"> " +
        "       <i class=\"fa fa-calendar\" aria-hidden=\"true\" id='calendar"+listnr+"-"+itemcount+"' style='font-size: 20px;'></i>" +
        "           <i class=\"fa fa-times\" aria-hidden=\"true\" id=\"crossout" +listnr+"-"+ itemcount + "\" style='font-size: 20px;'></i></label> " +
        "   </div></div>" +
        "</li>");
}*/
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

    //-----------Add new list-----------
    var count = 0; //the listnumber
    //Table with all dates in all lists
    var dateArr = [];
    //Table with all 'done'-items
    var donetab = [];
    $('#addlist').click(function () {
        count++;
        dateArr[count] = [];
        donetab[count] = [];

        //Adds html to the group of lists
        $("<div class=\"col-sm liste\" id='listnr"+count+"'><div class='row'>" +
            "<div class='col-sm-7' style='text-align: left'>" +
            "<div id='listname"+count+"' style='margin: 6px'><input type='text' class='form-control' id='listnameinput"+count+"'></div>" +
            "<div id='listnamelabel"+count+"'><h4>Liste"+count+"</h4></div></div>"+
            "<div class='col-sm-5' style='text-align: right'>" +
            "    <h4><i class=\"fa fa-circle\" aria-hidden=\"true\" style='color: white;' id='whitebutt"+count+"'></i>" +
            "        <i class=\"fa fa-circle\" aria-hidden=\"true\" style='color: lightpink;' id='pinkbutt"+count+"'></i> " +
            "        <i class=\"fa fa-circle\" aria-hidden=\"true\" style='color: #ffec8e;' id='yellowbutt"+count+"'></i> " +
            "        <i class=\"fa fa-circle\" aria-hidden=\"true\" style='color: lightgreen;' id='greenbutt"+count+"'></i></h4></div>" +
            "</div>" +
            "<ul class=\"list-group\" id=\"listoftasks"+count+"\"></ul>"+
            "<ul class=\"list-group\">"+
            "<li class=\"list-group-item\" id=\"newitem"+count+"\"><input type=\"text\" class=\"form-control\" id=\"newiteminput"+count+"\"></li>" +
            "<li class=\"list-group-item greyhover\" id=\"additem"+count+"\"><i class=\"fa fa-plus-circle\" aria-hidden=\"true\"></i> Add item</li></ul>" +
            "<i class=\"fa fa-list-ul\" aria-hidden=\"true\" style='font-size: 18px; margin: 7px' id='donebutton"+count+"'> Fullført</i>" +
            "</div><div class='col-sm liste' id='donetasks"+count+"'><h5 align='left'>Done tasks</h5>" +
            "<ul class='list-group' id='donelist"+count+"'><div align='center'><i class=\"fa fa-bars\" aria-hidden=\"true\" style='font-size: 15px; margin: 5px;' id='goback"+count+"'> Go back to tasks</i></div></ul>" +
            "</div>").insertAfter("#addlist");

        //duplicated jqueries
        var listname = $('#listname'+count);

        //Hides a number of elements to be shown with clicks etc
        listname.hide();
        $('#newitem'+count).hide();
        $('#dialog'+count).hide();
        $('#sharediv'+count).hide();
        $('#donetasks'+count).hide();

        //---------Opens input-field to change name of list--------
        $('#listnamelabel'+count).click(function(){
            var listnr = this.id.split("l").pop();
            $('#listnamelabel'+listnr).hide();
            $('#listname'+listnr).show();
            $('#listnameinput'+listnr).focus();
        });

        //---------Opens input-field for adding new tasks-------
        $('#additem'+count).click(function () {
            var label = this.id;
            var listnr = label.split("m").pop();
            $('#additem'+listnr).hide();
            $('#newitem'+listnr).show();
            $('#newiteminput'+listnr).focus();
        });

        //---------Edits name of list when enter is pressed-------
        $('#listnameinput'+count).keypress(function(event) {
            var label = this.id;
            var listnr = label.split("t").pop();
            if (event.keyCode === 13 || event.which === 13) {
                var name = $('#listnameinput'+listnr).val();
                var listnamelabel = $('#listnamelabel'+listnr);
                listnamelabel.show();
                listnamelabel.html('<h4>'+name+'</h4>');
                $('#listname'+listnr).hide();
            }
        });

        //---------Changes the background-colors when circles are clicked-------
        $('#pinkbutt'+count).click(function () {
            var label = this.id;
            var listnr = label.split("t").pop();
            var list = $('#listnr'+listnr);
            list.removeClass("pink green white yellow");
            list.addClass("pink");
        });
        $('#yellowbutt'+count).click(function () {
            var label = this.id;
            var listnr = label.split("t").pop();
            var list = $('#listnr'+listnr);
            list.removeClass("pink green white yellow");
            list.addClass("yellow");
        });
        $('#greenbutt'+count).click(function () {
            var label = this.id;
            var listnr = label.split("t").pop();
            var list = $('#listnr'+listnr);
            list.removeClass("pink green white yellow");
            list.addClass("green");
        });
        $('#whitebutt'+count).click(function () {
            var label = this.id;
            var listnr = label.split("t").pop();
            var list = $('#listnr'+listnr);
            list.removeClass("pink green white yellow");
            list.addClass("white");
        });




        //-------------Opens a list of all tasks that are done------------
        $('#donebutton'+count).click(function () {
            var listnr = this.id.split("n").pop();
            $('#donetasks'+listnr).show();
            $('#listnr'+listnr).hide();
            //Adds all elements in done-list to the current list
            if(donetab.length>1){
                for (var i=0; i<donetab[listnr].length; i++){
                    $('#donelist'+listnr).prepend('<li class="list-group-item marked" onclick="clicked(this)" id="doneitem'+listnr+"-"+i+'"><div class="row"><i class="fa fa-check-circle-o" aria-hidden="true" id="checked'+i+'" style="font-size: 15px;"></i>' +
                        '<i class="fa fa-circle-o" aria-hidden="true" id="unchecked'+i+'" style="font-size: 15px;"></i><div class="col-sm" id="doneitemtext'+listnr+'">'+donetab[listnr][i]+'</div></div>' +
                        '</li>');
                    $('#unchecked'+i).hide();
                }
                donetab[listnr]=[]; //resets done-tab


                //-------------------Goes back to main list of tasks-----------------
                $('#goback'+listnr).click(function () {
                    $('#donetasks'+listnr).hide();
                    $('#listnr'+listnr).show();
                });
            }
        });

        //-----------Hide input when focus goes out-----
        $("#newiteminput"+count).focusout(function () {
            var listnr = this.id.split("t").pop();
            $('#additem'+listnr).show();
            $('#newitem'+listnr).hide();
        });

        //---------Adds item to list when Enter is pressed----
        $("#newiteminput"+count).keypress(function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                itemcount++;

                var listnr = this.id.split("t").pop(); //Id of list
                var item = $('#newiteminput'+listnr).val(); //Value of inputfield


                $('#newiteminput'+listnr).val('');//Resets inputfield

                //----------Adds item-----------
                $('#listoftasks'+listnr).append("" +
                    "<li class=\"list-group-item marked\" id=\"elem"+listnr+"-"+itemcount+"\" style='padding: -2px; margin: -3px; font-size: 15px;'>" +
                    "   <div class='row'>" +
                    "       <div class=\"col-sm-5\" id='theitemdiv"+listnr+"-"+itemcount+"'><i class=\"fa fa-check-circle-o\" aria-hidden=\"true\" id='checked"+listnr+"-"+itemcount+"' style='font-size: 15px;'></i>" +
                    "           <i class=\"fa fa-circle-o\" aria-hidden=\"true\" id='unchecked"+listnr+"-"+itemcount+"' style='font-size: 15px;'></i> " +
                    "           "+item+"</div>" +
                    "       <div class='col-sm-7' style='text-align: right'>" +
                    "       <input class='inputdate' type=\"text\" id=\"datepicker"+listnr+"-"+itemcount+"\"> " +
                    "       <i class=\"fa fa-calendar\" aria-hidden=\"true\" id='calendar"+listnr+"-"+itemcount+"' style='font-size: 20px;'></i>" +
                    "           <i class=\"fa fa-times\" aria-hidden=\"true\" id=\"crossout" +listnr+"-"+ itemcount + "\" style='font-size: 20px;'></i></label> " +
                    "   </div></div>" +
                    "</li>");

                //-------------Sets dateformat and sets date inthe datedateArrtab------------
                $( function() {
                    $("#datepicker"+listnr+"-"+itemcount).datepicker({
                        //dateFormat: 'DD, mm-y'
                        dateFormat: 'dd/mm/y',
                        onSelect: function() {
                            var name = this.id;
                            var numbers = name.split("r").pop();
                            var thiscount =  numbers.split("-")[0];
                            var thisitemcount = numbers.split("-")[1];
                            dateArr[thiscount][thisitemcount] = $(this).datepicker('getDate');
                        }
                    });
                });
                //Hides elements yet to be shown
                $("#datepicker"+listnr+"-"+itemcount).hide();
                $('#checked'+listnr+"-"+itemcount).hide();


                //----------Makes task go to donelist---------------
                $('#theitemdiv'+count+"-"+itemcount).click(function(){
                    var listnr = this.id.split("v").pop();
                    var thiscount =  listnr.split("-")[0];
                    var thisitemcount = listnr.split("-")[1];

                    var thetext = $('#theitemdiv'+thiscount+"-"+thisitemcount).html();
                    var item = thetext.split(">").pop();
                    var len = donetab[thiscount].length;
                    donetab[thiscount][len]=item;
                    $('#checked'+thiscount+"-"+thisitemcount).show();
                    $('#unchecked'+thiscount+"-"+thisitemcount).hide();
                    $('#elem'+thiscount+"-"+thisitemcount).fadeOut(300);
                });

                //----------Deletes item-----------------------------
                $('#crossout'+count+'-'+itemcount).click(function () {
                    var numbers = this.id.split("t").pop();
                    var thiscount =  numbers.split("-")[0];
                    var thisitemcount = numbers.split("-")[1];
                    $('#elem'+thiscount+"-"+thisitemcount).remove();
                });

                //----------Adds due-date to task------------------------
                $('#calendar'+count+'-'+itemcount).click(function () {
                    var numbers = this.id.split("r").pop();
                    var thiscount =  numbers.split("-")[0];
                    var thisitemcount = numbers.split("-")[1];
                    var datepicker = $("#datepicker"+thiscount+"-"+thisitemcount);
                    if(datepicker.is(":visible")){
                        datepicker.hide();
                    }else{
                        if(datepicker.val()===""){
                            datepicker.show();
                            datepicker.focus();

                        }else{
                            datepicker.show();
                        }
                    }
                });
            }
        });
    });
});