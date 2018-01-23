var users = [];
var allUsers = [];
var me;

$('document').ready(function(){

    /**
     * This method retrieves information about the currency.
     */
    $.ajax({
        url: '/api/currency',
        method: 'GET',
        success: function (data){
            var h = "";
            for(var i = 0; i < data.length; i++){
                h += '<option value="' + data[i].currency_id + '">' + data[i].currency_long + '</option>';
            }
            $("#currency-input").html(h);
        }
    });

    /**
     * This method retrieves all users stored in the database.
     */
    $.ajax({
        url: '/api/user/all',
        method: 'GET',
        success: function(data){
            for(var i = 0; i < data.length; i++) {
                allUsers.push({
                    id: data.person_id,
                    name: data[i].forename + " " + (data[i].middlename ? data[i].middlename + " " : "") + data[i].lastname,
                    username: data[i].username
                });
            }
        }
    });


    /**
     * This method retrvies information about a user: person_id,forname and lastname
     */
    $.ajax({
        url: '/api/user/getUser',
        method: 'GET',
        data: {
            variables: [
                'person_id',
                'forename',
                'lastname'
            ]
        },
        success: function(data){
            me = data[0];
        }
    });

    /**
     * This method creates a new group, with the information filled in by the
     * user, when a user presses the addgroup-button. If a input field misses information
     * it will turn red.
     */
    $('#addgroup-checkbutton').click(function() {
        var groupname = $('#addgroup-groupname-input').val();
        if (groupname == "") {
            alert("Group name invalid");
        }
        $.ajax({
            url: '/api/group/name',
            method: 'GET',
            data: {
                group_name: groupname
            },
            success: function (data) {
                console.log(data);
                if (data) {
                    $.ajax({
                        url: '/api/group',
                        method: 'POST',
                        data: {
                            group_name: groupname,
                            currency: Number($("#currency-input").val())
                        },
                        success: function (data) {
                            console.log(data);
                            if(data.id){
                                var m = [];
                                for(var i = 0; i < users.length; i++){
                                    m.push(users[i].id);
                                }
                                console.log(m);
                                $.ajax({
                                    url: '/api/group/' + data.id + '/members',
                                    method: 'POST',
                                    data: {
                                        members: m
                                    },
                                    success: function(data){
                                        console.log(data);
                                        window.location="/group.html";
                                    },
                                    error: console.error
                                });
                            }
                        },
                        error: console.error
                    });
                }
                else {
                    $('#addgroup-groupname-input').css({
                        "border": "1px solid red",
                        "background": "#FFCECE"
                    });
                }
            }
        });
    });


    /**
     * This method allows a user to search all names or emails in the database by simply
     * entering a letter, optionally more, when adding more members to a group
     */
    $('#scrollable-dropdown-menu .typeahead').typeahead({
            highlight: true
        },
        {
            name: 'user-names',
            display: 'name',
            source: new Bloodhound({
                datumTokenizer: function(d){
                    return Bloodhound.tokenizers.whitespace(d.name).concat([d.email]);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                prefetch: '/api/user/all?slim=1'
            }),
            templates: {
                empty: [
                    '<div class="empty-message">',
                    'No users found',
                    '</div>'
                ].join('\n'),
                suggestion: Handlebars.compile('<div>{{name}} – {{email}}</div>')
            }
        }
    );

    $(".typeahead").bind('typeahead:select', function(a, data){
        if(!check(data))
            return;
        users.push(data);
        updateList();
    });

    $(".typeahead").bind('typeahead:close', function(){
        $(".typeahead").val("");
    });

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
    $('#login-norway').click(function () {
        $.ajax({
            url: '/api/language',
            method: 'GET',
            data: {
                lang: 'nb_NO',
                path: window.location.pathname
            },
            success: function (data) {
                for (var p in data) {
                    if (data.hasOwnProperty(p)) {
                        $("#" + p).html(data[p]);
                    }
                }
            }
        });
    });

    /**
     * This method calls the language api and sets the language to english
     * if the user clicks on the british flag.
     */
    $('#login-england').click(function () {
        $.ajax({
            url: '/api/language',
            method: 'GET',
            data: {
                lang: 'en_US',
                path: window.location.pathname
            },
            success: function (data) {
                for (var p in data) {
                    if (data.hasOwnProperty(p)) {
                        $("#" + p).html(data[p]);
                    }
                }
            }
        });
    });

    /**
     * This method sets the groups name.
     */
    $("#addgroup-groupname-input").focusout(function(){
        if($("#addgroup-groupname-input").val() == ""){
            $("#addgroup-groupname-input").css({
                "border": "1px solid #ced4da",
                "background": "white"
            });
            return;
        }
        $.ajax({
            url: '/api/group/name',
            method: 'GET',
            data: {
                group_name: $(this).val()
            },
            success: function(data){
                if(data)
                    $("#addgroup-groupname-input").css({
                        "border": "1px solid #ced4da",
                        "background": "white"
                    });
                else
                    $('#addgroup-groupname-input').css({
                        "border": "1px solid red",
                        "background": "#FFCECE"
                    });
            },
            error: console.error
        });
    });
});

/**
 * This function updates the memberlist, based on the name input from the user,
 * which members he wants to add.
 */
function updateList(){
    var h = "";
    for(var i = 0; i < users.length; i++){
        h += '<li class="list-group-item">' + users[i].name + '<i data-pid="' + users[i].id + '" style="float: right;" class="fa fa-times" area-hidden="true"></i></li>';
    }
    h += '<li class="list-group-item">You (administrator)</li>';
    $("#memberslist").html(h);

    $(".fa-times").click(function(){
        var id = $(this).data('pid');
        for(var i = 0; i < users.length; i++){
            if(users[i].id == id){
                users.splice(i, 1);
                break;
            }
        }
        updateList();
    });
}

function check(u){
    if(u.id == me.person_id)
        return false;
    for(var i = 0; i < users.length; i++){
        if(u.id == users[i].id)
            return false;
    }
    return true;
}

$('#addgroup-logout').click(function () {
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