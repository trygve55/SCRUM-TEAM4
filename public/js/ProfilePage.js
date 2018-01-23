var lang;
var user;
var curBudget;
var testetest;
var listItem, newListItem, balance, balanceItem, popupTextList, currentShoppingList;

/* Language */
$(document).ready(function () {
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

    $.ajax({
        url: '/api/user/getUser',
        method: 'GET',
        data: {
            variables: [
                'forename',
                'middlename',
                'lastname' ,
                'email',
                'phone',
                'username',
                'facebook_api_id',
                'shopping_list_id',
                'person_id',
                'gender',
                'birth_date'
            ]
        },
        success: function (data) {
            user = data[0];
            if(data == null){ // ?? sjekk
                return;
            }



            testetest = data[0].person_id;
            console.log(data[0]);

            var dato = data[0].birth_date;



            $('#profile-name').text(data[0].forename + '  ' + data[0].lastname);
            $('#p-forenam').val(data[0].forename);
            $('#p-middlenam').val(data[0].middlename);
            $('#p-lastnam').val(data[0].lastname);
            $('#p-usernam').val(data[0].username);
            $('#p-phonenumb').val(data[0].phone);
            var date = data[0].birth_date;
            var formattedDate = date;//.split("T")[0];
            $('#datepicker').val(formattedDate);


            $('#profile-email').text(data[0].email);
            $('#profile-phone').text(data[0].phone ? data[0].phone : "");
            $('#profile-username').text(data[0].username == data[0].facebook_api_id ? "" : data[0].username);
            $('#profile-name2').text(data[0].forename + '  ' + data[0].lastname);
            $('#profile-email2').text(data[0].email);
            $('#profile-phone2').text(data[0].phone ? data[0].phone : "");
            $('#profile-username2').text(data[0].username == data[0].facebook_api_id ? "" : data[0].username);
            $('#profpic').attr("src","api/user/" + data[0].person_id + "/picture");
            //setupShoppingList();


        }


    });

    $( "#datepicker" ).datepicker({
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true
    });

    $("#but").click(function () {
        if($('#datepicker').val() == '') {
            $.ajax({
                url: '/api/user/' + testetest,
                method: 'PUT',
                data: {
                    username: $('#p-usernam').val(),
                    forename: $('#p-forenam').val(),
                    middlename: $('#p-middlenam').val(),
                    lastname: $('#p-lastnam').val(),
                    phone: $('#p-phonenumb').val(),
                    birth_date: null
                },
                success: function (data) {
                    console.log(data)
                },
                error: console.error
            });
        }
        else{
            $.ajax({
                url: '/api/user/' + testetest,
                method: 'PUT',
                data: {
                    username: $('#p-usernam').val(),
                    forename: $('#p-forenam').val(),
                    middlename: $('#p-middlenam').val(),
                    lastname: $('#p-lastnam').val(),
                    phone: $('#p-phonenumb').val(),
                    birth_date: $('#datepicker').val()
                },
                success: function (data) {
                    console.log(data)
                },
                error: console.error
            });
        }
    });



    /**
     * Hides buttons, input
     */
    function inits(){

    }

    /*
    $('#media').carousel({
        pause: true,
        interval: false
    });
    */
    
});