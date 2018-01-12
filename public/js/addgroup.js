var users = [];

$('document').ready(function(){
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
        'url': '/api/user/all',
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
});

function memberSearchValidator(strs){
    return function findMatches(q, cb) {
        var matches, substringRegex;

        // an array that will be populated with substring matches
        matches = [];

        // regex used to determine if a string contains the substring `q`
        substrRegex = new RegExp(q, 'i');

        // iterate through the pool of strings and for any string that
        // contains the substring `q`, add it to the `matches` array
        $.each(strs, function(i, str) {
            if (substrRegex.test(str)) {
                matches.push(str);
            }
        });

        cb(matches);
    };
}