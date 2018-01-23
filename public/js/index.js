var homeFeedPost;
$(function () {
    $.ajax({
        url: '/template',
        method: 'GET',
        data: {
            files: [
                'newsfeedPostHome.html'
            ]
        },
        success: function (data){
            homeFeedPost = Handlebars.compile(data['newsfeedPostHome.html']);
            prep();
        }
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
    $('#index-norway').click(function () {
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
                        for (var p in data) {
                            if (data.hasOwnProperty(p)) {
                                $("#" + p).html(data[p]);
                            }
                        }
                    }
                });
            }
        });
    });

    /**
     * This method calls the language api and sets the language to english
     * if the user clicks on the british flag.
     */
    $('#index-england').click(function () {
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
                        for (var p in data) {
                            if (data.hasOwnProperty(p)) {
                                $("#" + p).html(data[p]);
                            }
                        }
                    }
                });
            }
        });
    });

    $('#index-logoutNavbar').click(function () {
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

    $.ajax({
        url:'/api/user/getUser',
        method:'GET',
        data: {
            variables: [
                'forename',
                'lastname'
            ]
        },
        success: function (data) {
            $('#index-username').text(data[0].forename + ' ' + data[0].lastname);
        },
        error: console.error
    });
});

function prep() {
    $.ajax({
        url: '/api/news/',
        method: 'GET',
        success: function (feed) {
            $('#newsfeedPost').html("");
            console.log(feed);
            for (var i = 0; i < feed.length; i++) {
                var length = 50;
                var text = feed[i].post_text.split(" ");
                var short = "";
                var rest = "";
                for (var j = 0; j < length && j < text.length; j++) {
                    short += text[j] + " ";
                }
                for (var k = j; k < text.length; k++) {
                    rest += text[k] + " ";
                }
                a = new Date(feed[i].posted_datetime);
                testy = a.toDateString();
                $('#newsfeedPost').append(homeFeedPost({
                    name: feed[i].forename + (feed[i].middlename ? ' ' + feed[i].middlename : '') + ' ' + feed[i].lastname,
                    payload: '',
                    groupname: feed[i].group_name,
                    text: short,
                    rest_text: rest,
                    image_url: '/api/user/' + feed[i].person_id + '/picture_tiny',
                    data: 'data-id="' + feed[i].post_id + '"',
                    datetime: testy,
                    lang_read_more: "Read more..."
                }));
                console.log(k);
                if(k <= length) {
                    $("#newsfeedPost div[data-id=" + feed[i].post_id + "] a").hide();
                } else {
                    $("#newsfeedPost div[data-id=" + feed[i].post_id + "] a").click(function(){
                        console.log("HEI");
                        $(this).closest("div").find("span").show();
                        $(this).remove();
                    });
                }

            }
        }
    });
}