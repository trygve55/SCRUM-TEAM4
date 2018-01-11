$(document).ready(
    function(){
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