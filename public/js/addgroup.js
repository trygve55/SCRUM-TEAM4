$('#addgroup-checkbutton').click(function(){
   var groupname = addgroup-groupname-input.valueOf();
   if(groupname=""){
       alert("Tom gruppenavn");
   }else{
       var currency = currency.valueOf();
       var picture = picture-input.valueOf();
   }
});


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
            $("#addgroup-member").attr("placeholder", data["addgroup-member"]);
        }
    });
});

