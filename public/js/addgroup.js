$(function (){
    $.ajax({
        url: '/api/language',
        method: 'GET',
        data: {
            lang: 'en_US',
            path: window.location.pathname
        },
        success: function(data){
            for(var p in data){
                if(data.hasOwnProperty(p)){
                    $("#" + p).html(data[p]);
                }
            }
            $("#addgroup-adminvalue").attr("placeholder", data["addgroup-adminvalue"]);
        }
    });
});