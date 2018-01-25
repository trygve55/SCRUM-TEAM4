var lang;
var user;
var curBudget;
var testetest;
var shopid;
var listItem, newListItem, balance, balanceItem, popupTextList, currentShoppingList;


$(document).ready(function () {

    //$('#passwordarea').hide();
    $('#save-success').hide();
    $('#old-password-error').hide();
    $('#change-password-error').hide();


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

    /**
     * Method that checks if the user is logged into facebook, if so
     * the password fields and change password button will be hidden.
     */
    $.ajax({
        url: '/api/user/checkFacebook',
        method: 'GET',
        success: function (data) {
            console.log(data);
            if(data.facebook == true) {
                $('#passwordarea').hide();
            }else{
                $('#passwordarea').show();
            }

        },
        error: console.error
    });

    /**
     * Method to get information about the logged in user
     */
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
            shopid = data[0].shopping_list_id;

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
                //var formattedDate = new Date(date).toIsoString().slice(0,10); //split("T")[0];
                var formattedDate = date.split("T")[0];

                console.log(date);
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

    /**
     * Method to change format for datepicker
     */
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

    /**
     * Method for saving info that has been written into input fields
     */
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
                    gender: $('#p-gen').val(),
                    birth_date: null
                },
                success: function (data) {
                    $('#save-success').show();
                    console.log(data);
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
                    gender: $('#p-gen').val(),
                    birth_date: $('#datepicker').val()
                },
                success: function (data) {
                    $('#save-success').show();
                    console.log(data)
                },
                error: console.error
            });
        }
    });



    /**
     * Method that first checks if the old password that the user has
     * written is correct, if so it changes password.
     */
    $("#pwbut").click(function () {
        // outer ajax checks if old password is correct
        $.ajax({
            url: '/api/user/checkPassword',
            method: 'POST',
            data: {
                password: $('#oldpwd').val()
            },
            success: function (data) {

                // inner ajax changes password, if old password was correct
                $.ajax({
                    url: '/api/user/password',
                    method: 'PUT',
                    data: {
                        password: $('#newpwd').val()
                    },
                    success: function (data) {
                        $('#old-password-error').hide();
                        $('#save-password-success').show();
                        console.log(data);
                    },
                    error: function () {
                        $('#old-password-error').hide();
                        $('#change-password-error').show();
                        console.error
                    }
                });
            },
            error: function () {
                $('#old-password-error').show();
            }
        });
    });




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

