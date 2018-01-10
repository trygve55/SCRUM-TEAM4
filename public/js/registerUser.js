/**
 * Created by odasteinlandskaug on 10.01.2018.
 */
$(function () {
   $.ajax({
       url: '/api/language',
       method: 'GET',
       data: {
           lang: 'en_US',
           path: window.location.pathname
    },
       success: function (data) {
           for(var p in data){
               if(data.hasOwnProperty(p)){
                   $("#" + p).html(data[p]);
               }
           }
           $("#register-username").attr("placeholder", data["register-username"]);
           $("#register-password").attr("placeholder", data["register-password"]);
           $("#register-repeatpassword").attr("placeholder", data["register-repeatpassword"]);
           $("#register-firstname").attr("placeholder", data["register-firstname"]);
           $("#register-lastname").attr("placeholder", data["register-lastname"]);
           $("#register-email").attr("placeholder", data["register-email"]);
           $("#register-phone").attr("placeholder", data["register-phone"]);
       }

       });
    $('#register-done').click(function (e) {
        if( $('#register-username').val() === ""){
            alert('empty');
            e.preventDefault();
        }
        if( $('#register-password').val()=== ""){
            alert('empty');
            e.preventDefault();
        }
        if( $('#register-repeatpassword').val()=== ""){
            alert('empty');
            e.preventDefault();
        }
        if( $('#register-firstname').val()=== ""){
            alert('empty');
            e.preventDefault();
        }
        if( $('#register-email').val()=== ""){
            alert('empty');
            e.preventDefault();
        }

    })

});




