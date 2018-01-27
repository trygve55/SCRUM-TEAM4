var lang;
var user;
var curBudget;
var testetest;
var shopid;
var balance, balanceItem, popupTextList;


$(document).ready(function () {

    //$('#passwordarea').hide();
    $('#save-success').hide();
    $('#old-password-error').hide();
    $('#change-password-error').hide();
    $('#profpicsuccess').hide();
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
        console.log("hei");
        $.ajax({
            url: '/api/language',
            method: 'POST',
            data: {
                lang: 'en_US'
            },
            success: function () {
                console.log("fer");
                $.ajax({
                    url: '/api/language',
                    method: 'GET',
                    success: function (data) {
                        console.log(data);
                        lang = data;
                        for (var p in data) {
                            if (data.hasOwnProperty(p)) {
                                $("#" + p).html(data[p]);
                            }
                        }
                    },
                    error: console.error
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
            $('#p-gen').val(data[0].gender);
            $('#profile-email').text(data[0].email);
            $('#profile-phone').text(data[0].phone ? data[0].phone : "");
            $('#profile-username').text(data[0].username == data[0].facebook_api_id ? "" : data[0].username);
            $('#profile-name2').text(data[0].forename + '  ' + data[0].lastname);
            $('#profile-email2').text(data[0].email);
            $('#profile-phone2').text(data[0].phone ? data[0].phone : "");
            $('#profile-username2').text(data[0].username == data[0].facebook_api_id ? "" : data[0].username);
            if (data[0].birth_date) {
                var date = data[0].birth_date;
                var formattedDate = date.split("T")[0];
                var nysplitt = formattedDate.split('-');
                var tallet = parseInt(nysplitt[2]);
                var tallaaa = tallet+1;
                var tall = tallaaa.toString();
                if(tall < 10){
                    tall = 0 + tall;
                }
                var riktigdato = nysplitt[0] + '-' + nysplitt[1] + '-' + tall;
                $('#datepicker').val(riktigdato);
            }
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


    /**
     * Method that calls on the method underneath when change photo is clicked
     */
    $("#p-changephoto").click(function () {
        $("#file-upload").trigger("click");
    });

    /**
     * Method for uploading profile picture
     */
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
                $('#profpicsuccess').show();
            }
        });
    });

    /**
     * Method for saving info that has been written into input fields when
     * save info button has been clicked.
     */
    $("#but").click(function () {
        changeInfo();
    });

    /**
     * Methid for saving info when enter is pressed while the
     * date field is selected.
     */
    $('#datepicker').keypress(function (e) {
        if (e.keyCode != 13 || e.which != 13)
            return;
        changeInfo();

    });



    /**
     * Method for changing password when the save password button is clicked.
     */
    $("#pwbut").click(function () {
        // outer ajax checks if old password is correct
       changePassword();
    });

    /**
     * Method for changing password when enter is pressed.
     */
    $('#newpwd').keypress(function (e) {
        if(e.keyCode!=13 || e.which!=13)
            return;
        changePassword();
    });

    /**
     * Method for logging out.
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

/**
 * Function for changing information about the user. Saves new info in database
 */
function changeInfo() {
    // if no birthdate is entered, null is saved in the database
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
    // if a birthday is entered, the value is saved in the database
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
                console.log($('#datepicker').val());
            },
            error: console.error
        });
    }
}

/**
 * Method for password of a user. Checks if the old password is correct and
 * if the new password is not allowed.
 */
function changePassword() {
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
}
