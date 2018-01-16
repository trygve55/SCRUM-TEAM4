var users = [];
var allUsers = [];
var me;

$('document').ready(function(){
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
                if (data) {
                    $.ajax({
                        url: '/api/group',
                        method: 'POST',
                        data: {
                            group_name: groupname,
                            currency: Number($("#currency-input").val())
                        },
                        success: function (data) {
                            if(data.id){
                                var m = [];
                                for(var i = 0; i < users.length; i++){
                                    m.push(users[i].id);
                                }
                                $.ajax({
                                    url: '/api/group/members',
                                    method: 'POST',
                                    data: {
                                        members: m,
                                        group_id: data.id
                                    },
                                    success: function(data){

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
        });
/*
    $('#addgroup-member').keypress(function(event) {
        if(event.keyCode == 13 || event.which == 13){
            addmember();
        }
    });*/

    // TODO: What if user already is seleced? alert...?
    // TODO: Remove users from selection
    $(".typeahead").bind('typeahead:select', function(a, data){
        if(!check(data))
            return;
        $(".typeahead").val("");
        users.push(data);
        updateList();
    });

    $(".typeahead").bind('typeahead:close', function(){
        $(".typeahead").val("");
    });

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

function updateList(){
    var h = "";
    for(var i = 0; i < users.length; i++){
        h += '<li class="list-group-item">' + users[i].name + '</li>';
    }
    h += '<li class="list-group-item">You (administrator)</li>';
    $("#memberslist").html(h);
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