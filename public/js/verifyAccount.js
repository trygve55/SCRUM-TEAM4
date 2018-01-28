$('document').ready(function () {

    $('#forgot-email-error').hide();
    $('#forgot-email-success').hide();

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

    $('#forgotPassword-norway').click(function () {
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

    $('#forgorPassword-england').click(function () {
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
            url: '/api/user/verifyAccount',
            method: 'POST',
            data: {
                token: new URL(window.location.href).searchParams.get('token')
            },
            success: function (data){
                $('#forgot-email-error').hide();
                $('#forgot-email-success').show();
                console.log(data)
            },
            error: function () {
                $('#forgot-email-error').show();
                console.error
            }
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
