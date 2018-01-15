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
            'email' ,
            'phone',
            'username',
            'facebook_api_id'
            ]
        },
        success: function (data) {
            $('#profile-name').text(data[0].forename + '  ' + data[0].lastname);
            $('#profile-email').text(data[0].email);
            $('#profile-phone').text(data[0].phone ? data[0].phone : "");
            $('#profile-username').text(data[0].username == data[0].facebook_api_id ? "" : data[0].username);
        }
    })

});



$(document).ready(
    function(){

        inits();

        function inits(){
            $('#inputitem').hide();
            $('#inputtask').hide();
        }

        $('#additem').click(function () {
            if( $('#inputitem').is(":visible")){
                $('#inputitem').hide();
                var item = $('#newitem').val();
                $('#newitem').val('');
                $('#itemlist').append("<li class=\"list-group-item\"><div class=\"checkbox\"> <label><input type=\"checkbox\">  "+item+"</label> </div> </li>");

            }
            $('#inputitem').show();
        });

        $('#newitem').keypress(function(event) {
            if (event.keyCode == 13 || event.which == 13) {
                $('#inputitem').hide();
                var item = $('#newitem').val();
                $('#newitem').val('');
                $('#itemlist').append("<li class=\"list-group-item\"><div class=\"checkbox\"> <label><input type=\"checkbox\">  "+item+"</label> </div> </li>");

            }
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


        $('#add-item-button').click(
            function(){
                var toAdd = $('input[name=item]').val();
                $('#shoppinglist').append('<li class="list-group-item">' + toAdd + '</li>');
            });

        $('#add-task-button').click(
            function(){
                var toAdd = $('input[name=task]').val();
                $('#taskList').append('<li class="list-group-item">' + toAdd + '</li>');
            });

        $(document).ready(function() {
            $('#media').carousel({
                pause: false,
                interval: true,
            });
        });

        $("input[name=item]").keyup(function(event){
            if(event.keyCode == 13){
                $("#shoppinglist").click();
            }
        });

        $(document).on('dblclick','li', function(){
            $(this).toggleClass('strike').fadeOut('slow');
        });

        $('input').focus(function() {
            $(this).val('');
        });


    }
);
