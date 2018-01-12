$(document).ready(



    function(){

        inits();

        function inits(){
            $('#inputitem').hide();
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
                $('#itemtask').append("<li class=\"list-group-item\"><div class=\"checkbox\"> <label><input type=\"checkbox\">  "+item+"</label> </div> </li>");

            }
            $('#inputitem').show();
        });

        $('#newtask').keypress(function(event) {
            if (event.keyCode == 13 || event.which == 13) {
                $('#inputitem').hide();
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

        $('ol').sortable();



    }
);