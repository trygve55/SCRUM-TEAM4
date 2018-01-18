$(document).ajaxSuccess(function(e, r){
    if(r.responseJSON.redirect)
        window.location = r.responseJSON.redirect;
});

$(document).ready(function(){
    if (window.location == "/index.html" || window.location == "/") $.ajax({
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