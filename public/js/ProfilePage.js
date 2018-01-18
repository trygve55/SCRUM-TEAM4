/* Language */
$(function () {
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

    $('#profile-norway').click(function () {
        $.ajax({
            url: '/api/language',
            method: 'POST',
            data: {
                lang: 'nb_NO'
            },
            success: function () {
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
            },
            error: console.error
        });

    });

    $('#profile-england').click(function () {
        $.ajax({
            url: '/api/language',
            method: 'POST',
            data: {
                lang: 'en_US'
            },
            success: function () {
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
            },
            error: console.error
        });
    });

    $.ajax({
        url: '/api/user/getUser',
        method: 'GET',
        data: {
            variables: [
            'forename',
            'lastname' ,
            'email',
            'phone',
            'username',
            'facebook_api_id'
            ]
        },
        success: function (data) {

            if(data == null){ // ?? sjekk
                return;
            }

            $('#profile-name').text(data[0].forename + '  ' + data[0].lastname);
            $('#profile-email').text(data[0].email);
            $('#profile-phone').text(data[0].phone ? data[0].phone : "");
            $('#profile-username').text(data[0].username == data[0].facebook_api_id ? "" : data[0].username);
            $('#profile-name2').text(data[0].forename + '  ' + data[0].lastname);
            $('#profile-email2').text(data[0].email);
            $('#profile-phone2').text(data[0].phone ? data[0].phone : "");
            $('#profile-username2').text(data[0].username == data[0].facebook_api_id ? "" : data[0].username);
        }
    });

});



$(document).ready(
    function(){

        inits();

        /**
         * Hides buttons, input
         */
        function inits(){
            $('#inputitem').hide();
            $('#inputtask').hide();
            $('#regretbutton').hide();
        }

        /**
         * when add item button is clicked, hides add item button, shows input
         */
        $('#additem').click(function () {
            $('#inputitem').show();
            $('#additem').hide();
            $('#newitem').focus();
        });

        $('#addtask').click(function () {
            $('#inputtask').show();
            $('#addtask').hide();
            $('#newtaskw').focus();
        })


        var count=0;
        $('#newitem').keypress(function(event) {
            if (event.keyCode == 13 || event.which == 13) {
                var item = $('#newitem').val();
                $('#newitem').val('');
                count++;
                $('#itemlist').append("<li id='itemid"+count+"' class=\"list-group-item\"><div class='row'><div class=\"col-sm checkbox\"> <label id='labelitem'><input id='labelitem' type=\"checkbox\"> <p id='hei"+count+"'> "+item+" </p></label> </div><div class='col-sm' align='right'><i class='fa fa-times' aria-hidden='true' id='cross"+count+"'></div></div></li>");

                $('#cross'+count).click(function () {
                    var table = [];
                    var n = this.id;
                    var ide = n.split("s").pop();

                    var removed = $('#hei'+ide).text();
                    $('#itemid'+ide).remove();

                    $('#regretbutton').show();


                    $('#regretbutton').click(function () {
                        $('#itemlist').append("<li id='itemid"+ide+"' class=\"list-group-item\"><div class='row'><div class=\"col-sm checkbox\"><label><input type=\"checkbox\"><p id='hei"+ide+"'>"+removed+"</p></label></div><div class='col-sm' align='right'><i class='fa fa-times' aria-hidden='true' id='cross"+ide+"'></div></div></li>");
                    });
                });
            }
        });

        $('#newtask').keypress(function(event) {
            if (event.keyCode == 13 || event.which == 13) {
                var item = $('#newtask').val();
                $('#newtask').val('');
                count++;
                $('#tasklist').append("<li id='taskid"+count+"' class=\"list-group-item\"><div class='row'><div class=\"col-sm checkbox\"> <label id='labelitem'><input id='labelitem' type=\"checkbox\"> <p id='hei'> "+item+" </p></label> </div><div class='col-sm' align='right'><i class='fa fa-times' aria-hidden='true' id='cross"+count+"'></div></div></li>");

                $('#cross'+count).click(function () {
                    var table = [];
                    var n = this.id;
                    var ide = n.split("s").pop();

                    var removed = $('#hei').val();
                    $('#taskid'+ide).remove();

                    $('#regretbutton').show();



                    $('#regretbutton').click(function () {
                        $('#itemlist').append("<li id='taskid' class=\"list-group-item\"><div class='row'><div class=\"col-sm checkbox\"> <label><input type=\"checkbox\">  "+removed+"</label> </div><div class='col-sm' align='right'><i class='fa fa-times' aria-hidden='true' id='cross'></div></div></li>");
                    })
                });
            }
        });

        $('#shoppingcart'+count).click(function () {
            var table = [];
            var navn = this.id;
            var ide = navn.split("").pop();

            $(".checkbox").each(function () {
                if($(this).is(':checked')){
                    var numb = this.id;
                    var nr = numb.split("x").pop();
                    var ss = nr[1];
                    var htmllab = $('#labelitem'+ide+ss).html();
                    var item = htmllab.split(">").pop();
                    table.push(item);
                    document.getElementById('itemid'+ide+ss).remove();
                }
            });
            for(t in table){
                console.log(table[t]);
            }
        });

        $('#regretbutton'+count).click(function () {
            var table = [];
            var navn = this.id;

        });

        /* remove inputfield when out of focus*/
        $("#newitem").focusout(function () {
            $("#additem").show();
            $("#inputitem").hide();
        });

        $('#allshoppinglists').click(function () {
            location.href = "shoppinglist.html";
        });



        $('#addtask').click(function () {
            if( $('#inputtask').is(":visible")){
                $('#inputtask').hide();
                var item = $('#newtask').val();
                $('#newtask').val('');
                $('#tasklist').append("<li class=\"list-group-item\"><div class=\"checkbox\"> <label><input type=\"checkbox\">  "+item+"</label> </div> </li>");

            }
            $('#inputtask').show();
        });

        $('#newtask').keypress(function(event) {
            if (event.keyCode == 13 || event.which == 13) {
                $('#inputtask').hide();
                var item = $('#newtask').val();
                $('#newtask').val('');
                $('#tasklist').append("<li class=\"list-group-item\"><div class=\"checkbox\"> <label><input type=\"checkbox\">  "+item+"</label> </div> </li>");

            }
        });

        $('#add-task-button').click(
            function(){
                var toAdd = $('input[name=task]').val();
                $('#taskList').append('<li class="list-group-item">' + toAdd + '</li>');
            });


            $('#media').carousel({
                pause: true,
                interval: false,
            });

    }
);
