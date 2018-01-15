var users = [];

$('document').ready(function(){
    $.ajax({
        url: '/api/currency',
        mthod: 'GET',
        success: function (data){
            var h = "";
            for(var i = 0; i < data.length; i++){
                h += '<option value="' + data[i].currency_id + '">' + data[i].currency_long + '</option>';
            }
            $("#currency-input").html(h);
        }
    });

    $('#addgroup-checkbutton').click(function(){
        var groupname = $('#addgroup-groupname-input').val();
        if(groupname==""){
            alert("Groupname invalid");
        }else{
            var currency = $("#currency-input option:selected").text();
            var picture = $('input[type=file]').val();
            alert("curr:"+ currency + ", fil: " + picture +", gn: "+groupname);
            document.location.href = "index.html";
        }
    });

    $('#addgroup-adduser').click(function(){
        addmember();
    });

    $.ajax({
        url: '/api/user/all',
        method: "GET",
        success: function(data){
            var cnt = [];
            for(var i = 0; i < data.length; i++){
                var u = {
                    id: data[i].person_id,
                    name: data[i].forename + " " + (data[i].middlename ? data[i].middlename + " " : "") + data[i].lastname,
                    username: data[i].username
                };
                users.push(u);
                cnt.push(u.name);
            }
            $('#scrollable-dropdown-menu .typeahead').typeahead(null, {
                name: 'users',
                limit: 10,
                source: new Bloodhound({
                    datumTokenizer: Bloodhound.tokenizers.whitespace,
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    prefetch: '/api/user/all?slim=1'
                })
            });
        },
        error: console.error
    });

    $('#addgroup-member').keypress(function(event) {
        if(event.keyCode == 13 || event.which == 13){
            addmember();
        }
    });

    function addmember(){
        var member = $('#addgroup-member').val();
        $('ul').prepend('<li class="list-group-item">'+member+'</li>');
        $('#addgroup-member').val('');
    }

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
    })
});