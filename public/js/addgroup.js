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
