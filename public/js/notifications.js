var socket = io();

socket.on('invite group', function(data){

});

$(function(){
    $(".navbar-nav.ml-auto").prepend("<i style='margin-top: 10px; margin-right: 15px; font-size: 0.5em' id='notification-center' class='fa fa-bell' aria-hidden='true'></i>");
    $("#notification-center").click(function(){
        if($("#popup").length > 0)
            return $("#popup").remove();
        $("body").append("<div id=\"popup\" align='center' style='background-color: white; width: 100px'>Message!</div>");
        console.log($("#popup").width());
        $("#popup").css({
            'position': 'absolute',
            'left': $(this).offset().left - ($("#popup").width() / 2) + ($(this).width() / 2),
            'top': $(this).offset().top + $(this).height() + 5,
            border: 'red'
        }).show();
    });

    $("body").click(function(e){
        if(e.target.id == "myDiv" || $(e.target).parents("#myDiv").length)
            $("#popup").remove();
    });
});