$(document).ajaxSuccess(function(e, r){
    if(r.responseJSON.redirect)
        window.location = r.responseJSON.redirect;
});

$(document).ready(function(){
    console.log("test3");
    if (false) $.ajax({
        url: '/api/auth',
        method: "GET",
        success: function(data){
            if(!data.login) {
                window.location = "/login.html";
            }
        },
        error: console.error
    });
});