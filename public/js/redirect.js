$(document).ajaxSuccess(function(e, r){
    if(r.responseJSON.redirect)
        window.location = r.responseJSON.redirect;
});