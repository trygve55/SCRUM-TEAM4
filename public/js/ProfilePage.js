var lang;
var user;
var curBudget;
var testetest;
var listItem, newListItem, balance, balanceItem, popupTextList, currentShoppingList;


$(document).ready(function () {

    $('#profpic').attr("src","api/user/" + localStorage.person_id + "/picture");

    /**
     * This method calls the language api and sets the standard language as
     * norwegian.
     */
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

    /**
     * This method calls the language api and sets the language to norwegian
     * if the user clicks on the norwegian flag.
     */
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

    /**
     * This method calls the language api and sets the language to english
     * if the user clicks on the british flag.
     */
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
            if (data[0].birth_date) {
                var date = data[0].birth_date;
                var formattedDate = date.split("T")[0];
                $('#datepicker').val(formattedDate);
            }


            $('#profile-email').text(data[0].email);
            $('#profile-phone').text(data[0].phone ? data[0].phone : "");
            $('#profile-username').text(data[0].username == data[0].facebook_api_id ? "" : data[0].username);
            $('#profile-name2').text(data[0].forename + '  ' + data[0].lastname);
            $('#profile-email2').text(data[0].email);
            $('#profile-phone2').text(data[0].phone ? data[0].phone : "");
            $('#profile-username2').text(data[0].username == data[0].facebook_api_id ? "" : data[0].username);
        }


    });

    $( "#datepicker" ).datepicker({
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true
    });


    $("#p-changephoto").click(function () {
        $("#file-upload").trigger("click");
    });

    $("#file-upload").change(function () {


        var formData = new FormData();
        formData.append('File', $("#file-upload")[0].files[0]);

        $.ajax({
            url : 'api/user/picture',
            type : 'POST',
            data : formData,
            processData: false,  // tell jQuery not to process the data
            contentType: false,  // tell jQuery not to set contentType
            success : function(data) {
                console.log(data);
                d = new Date();
                $('#profpic').attr("src","api/user/" + testetest + "/picture?t="+d.getTime());
            }
        });
    });

    $("#but").click(function () {
        if($('#datepicker').val() == '') {
            $.ajax({
                url: '/api/user/',
                method: 'PUT',
                data: {
                    username: $('#p-usernam').val(),
                    forename: $('#p-forenam').val(),
                    middlename: $('#p-middlenam').val(),
                    lastname: $('#p-lastnam').val(),
                    phone: $('#p-phonenumb').val(),
                    //gender: $('#p-gen').valueOf(),
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
                url: '/api/user/',
                method: 'PUT',
                data: {
                    username: $('#p-usernam').val(),
                    forename: $('#p-forenam').val(),
                    middlename: $('#p-middlenam').val(),
                    lastname: $('#p-lastnam').val(),
                    phone: $('#p-phonenumb').val(),
                    //gender: $('#p-gen').valueOf(),
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

    $('#profile-logout').click(function () {
        $.ajax({
            url: '/api/auth/logout',
            method: 'POST',
            success: function (data) {
                if(!data.login){
                    window.top.location="http://localhost:8000/login.html";
                }
            }
        });
    });


});

