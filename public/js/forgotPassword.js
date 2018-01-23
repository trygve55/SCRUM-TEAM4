/**
 * Created by Eline on 15.01.2018.
 */
$('document').ready(function () {
    /* Language */


    $.ajax({
        url: '/api/language',
        method: 'GET',
        data: {
            lang: 'nb_NO',
            path: window.location.pathname
        },
        success: function (data) {
            lang = data;
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
                        lang = data;
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
                        lang = data;
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



    $('#resetbut').click(function () {
        $.ajax({
            url: '/api/user/forgottenPasswordEmail',
            method: 'POST',
            data: {
                email: $('#emailadr').val()
            },
            success: function (data){
                console.log(data)
            },
            error: console.error
        });
    });

    $('#emailadr').keypress(function (e) {
        if(e.keyCode!=13||e.which!=13)
            return;
        $.ajax({
            url: '/api/user/forgottenPasswordEmail',
            method: 'POST',
            data: {
                email: $('#emailadr').val()
            },
            success: function (data){
                console.log(data)
            },
            error: console.error
        });
    });
});
/*
function reset() {
	var adress = $("#adrinput"), exists;
	$.ajax({type:"GET", url:"api/mail/" + adress.val(), contentType:"application/json", dataType:"json",
		success:function(result) {exists = (result.message === 'E-mail already exists');}
	});	// Change to POST with all the tokens and stuffs.
	
	if (exists) {
		// 1. Get a temp password.
		
		// 2. Send EMAIL with link.
		
	}
	else {
		adress.val("");
		adress.attr("placeholder", "Email doesn't exist.");
	}
}
*/