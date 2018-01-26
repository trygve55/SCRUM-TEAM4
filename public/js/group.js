var activeTab = "feed", currentGroup, listItem, newListItem, balance, balanceItem, popupTextList, currentShoppingList, feedPost, readMore, taskItem, popupAssign;
var stTransparent = "0.5",
	statColours = [["(0, 30, 170, " + stTransparent + ")", "(0, 0, 132, 1)"], ["(170, 30, 0, " + stTransparent + ")", "(132, 0, 0, 1)"]],
	statLabels = ["Income", "Expenses"];
const MILLIS_DAY = 86400000;
var statColours = [["(0, 30, 170, 0.5)", "(0, 0, 132, 1)"], ["(170, 30, 0, 0.5)", "(132, 0, 0, 1)"]], statLabels = ["Income", "Expenses"];

socket.on('group post', function(data){
    for(var i = 0; i < data.length; i++) {
        if(data[i].group_id != currentGroup.group_id)
            continue;
        var length = 50;
        var text = data[i].post_text.split(" ");
        var short = "";
        var rest = "";
        for(var j = 0; j < length && j < text.length; j++){
            short += text[j] + " ";
        }
        for(var k = j; k < text.length; k++){
            rest += text[k] + " ";
        }
        $("#posts").prepend(feedPost({
            name: data[i].forename + (data[i].middlename ? ' ' + data[i].middlename : '') + ' ' + data[i].lastname,
            payload: ((data[i].attachment_type === 1) ? '/api/news/data/' + data[i].post_id : ''),
            text: short,
            rest_text: rest,
            image_url: '/api/user/' + data[i].person_id + '/picture_tiny',
            data: 'data-id="' + data[i].post_id + '"',
            datetime: testy,
            lang_read_more: "Read more..."
        }));
        if(k <= length)
            $("#posts div[data-id=" + data[i].post_id + "] a").hide();
        else {
            $("#posts div[data-id=" + data[i].post_id + "] a").click(function(){

                $(this).closest("div").find("span").show();
                $(this).remove();
            });
        }
    }
});

socket.on('group task', function(data){
    console.log("socket task");
    console.log(data);
    var found = 0;
    for(var i = 0; i < dataTask.length; i++){
        for(var j = 0; j < data.length; j++) {
            if (dataTask[i].todo_id == data[j].todo_id) {
                dataTask[i] = data[j];
                found++;
                break;
            }
        }
    }
    if(found != data.length) {
        if(found == 0)
            dataTask = dataTask.concat(data);
        else {
            for(var j = 0; j < data.length; j++) {
                var f = false;
                for(var i = 0; i < dataTask.length; i++){
                    if (dataTask[i].todo_id == data[j].todo_id) {
                        f = true;
                        break;
                    }
                }
                if(!f)
                    dataTask.push(data[j]);
            }
        }
    }
    if(activeTab == "tasks"){
        if($("#cur-tasks").is(":visible"))
            showCurTasks();
        else
            showDoneTasks();
    }
});

socket.on('group task remove', function(data){
    console.log("socket remove task");
    console.log(data);
    for(var i = 0; i < dataTask.length; i++){
        if(dataTask[i].todo_id == data)
            dataTask.splice(i, 1);
    }
    if(activeTab == "tasks"){
        if($("#cur-tasks").is(":visible"))
            showCurTasks();
        else
            showDoneTasks();
    }
});


/**
 * When the page loads, the page must find the groups available to the user so they can be selected.
 */
$(function() {
    $.ajax({
        url: '/template',
        method: 'GET',
        data: {
            files: [
                'listItem.html',
                'newListItem.html',
                'balance.html',
                'balanceItem.html',
                'popupTextfieldList.html',
                'newsfeedPost.html',
                'taskItem.html',
                'taskListGroup.html',
                'taskItemDone.html',
                'popupAssign.html'
            ]
        },
        success: function (data){
            listItem = Handlebars.compile(data['listItem.html']);
            newListItem = Handlebars.compile(data['newListItem.html']);
            balance = Handlebars.compile(data['balance.html']);
            balanceItem = Handlebars.compile(data['balanceItem.html']);
            popupTextList = Handlebars.compile(data['popupTextfieldList.html']);
            feedPost = Handlebars.compile(data['newsfeedPost.html']);
            taskItem = Handlebars.compile(data['taskItem.html']);
            taskListGroup = Handlebars.compile(data['taskListGroup.html']);
            taskItemDone = Handlebars.compile(data['taskItemDone.html']);
            popupAssign = Handlebars.compile(data['popupAssign.html']);
        }
    });

    /**
     *  Retrieves the group information for groups the current user inhabit. Group information
     *  changes based on which group the user clicks on.
     */
    $.ajax({
		url:'/api/group/me',
		method:'GET',
		success: function (data) {
			var grouplist = data;


			currentGroup = data[0];
			for(var i = 0; i < data.length; i++){
				addGroupToList(data[i]);
			}
			$(".group").click(function(){
                if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                    $("html, body").animate({ scrollTop: $(document).height() }, "slow");
                }
			    $('#groupwindowStart').hide();
				$('#groupwindow').show();
				currentGroup = $(this).data("group-id");

				for(var i = 0; i < grouplist.length; i++) {
					if (currentGroup == grouplist[i].group_id){
						currentGroup = grouplist[i];
						break;
					}
				}

				changeTab();
			});
		},
		error: console.error()
	});

    $("#group-picturePost").click(function () {

        $("#file-attachment").trigger("click");
    });

	loadLanguageText();
});

/**
 * This method loads the language from the API.
 */
function loadLanguageText() {
    $.ajax({
        type:"GET",
        url:"/api/language",
        contentType:"application/json",
        dataType:"json",
        success:function(result) {
            for (var p in result) {
                if(result.hasOwnProperty(p)) {
                    $("#" + p).html(result[p]);
                    $("." + p).html(result[p]);
                }
            }
        }
    });
}

/**
 * This method clears the feed post inputfield when user press the post-button
 */
function ClearFields() {
    document.getElementById("group-newsfeedPost").value = "";
}

/**
 * When the user clicks on a tab, load and show the information within, and hide any other tabs.
 */
function changeTab(name) {
	$('#stat0').remove();
	$('#stat1').remove();
    activeTab='feed';
    if(name)
        activeTab = name;
    else
        name = activeTab;
    var tabs = $(".grouptab");
    for (var i = 0; i < tabs.length; i++)
        $(tabs[i]).hide()
    $("#" + name).show();
    activeTab = name;
    if(activeTab=='shopping')
        getShoppinglist();
    else if(activeTab=='feed')
        getPost();
    else if(activeTab=='tasks')
        getTasks();
    else if (activeTab == 'statistics') {
		createLabelOptions();
        drawChart();
		$("#date_start").datepicker({startDate: '-10d'});
		$("#date_end").datepicker();
    }
    else if(activeTab == 'food')
        getCalendar();
}

/**
 * When a group is created, it must be added to the list.
 */

function addGroupToList(group) {
    var groups = $(".tablink");
    for (var i = 0; i < groups.length; i++) {
        if ($(groups[i]).html() == group.group_name) return;
    }
    $("#groupselection").append('<div style="padding-top: 2px; height: 30px; border-radius: 10px; background-color: white; -moz-box-shadow: inset 0 0 3px grey; -webkit-box-shadow: inset 0 0 3px grey; box-shadow: inset 0 0 3px grey;" class="tablink text-center backvariant group" data-group-id="' + group.group_id + '">' + group.group_name + '</div><h4></h4>');
}

/**
 * Delete any groups which are no longer available to this user.
 */
function removeDeletedGroups(validNames) {
    $(".tablink").each(function() {
        var exists = false;
        for (var i = 0; i < validNames.length; i++) {if ($(this).html() == validNames[i]) {exists = true;}}
        if (!exists) {$(this).remove();}
    });
}

/**
 * This method redirect the user to the add group page when the addGroup button is clicked.
 */
function addGroup(){
    window.location = 'addGroup.html'
}


/**
 * This method retrieves the shoppinglists from the database and puts the entires, if there
 * are any, into the shoppinglist.
 *
 */
function getShoppinglist() {
    $.ajax({
        url: "/api/shoppingList/" + currentGroup.shopping_list_id,
        method: "GET",
        success: function (data) {
            currentShoppingList = data;
            $('.itemlist').html("");
            for(var i = 0; i < data.shopping_list_entries.length; i++){
                if(data.shopping_list_entries[i].purchased_by_person_id)
                    continue;
                $('.itemlist').append(listItem({
                    entry_id: data.shopping_list_entries[i].shopping_list_entry_id,
                    entry_text: data.shopping_list_entries[i].entry_text
                }));
            }
            setupClicks();
        }
    });
}

/**
 * This function
 */
function setupClicks(){
    $(".list-name").unbind("click").click(function(){
        var listId = $(this).closest("div[data-id]").data("id");
        var title = $(this).html();
        $(this).hide();
        var div = $(this).parent().children(".list-name-div");
        $(div).show();
        $(div).children(".list-name-input").val(title).focus();
    });

    $(".list-name-input").unbind("focusout").focusout(function(){
        var text = $(this).val();
        var id = $(this).closest("div[data-id]").data("id");
        var h4 = $(this).parent().parent().children(".list-name");
        $(h4).html(text);
        $(this).parent().hide();
        $(h4).show();
        $.ajax({
            url: '/api/shoppingList/' + id,
            method: 'PUT',
            data: {
                shopping_list_name: text
            }
        });
    });

    $(".list-name-input").unbind("keypress").keypress(function(e){
        if(e.keyCode != 13 && e.which != 13)
            return;
        var text = $(this).val();
        var id = $(this).closest("div[data-id]").data("id");
        var h4 = $(this).parent().parent().children(".list-name");
        $(h4).html(text);
        $(this).parent().hide();
        $(h4).show();
        $.ajax({
            url: '/api/shoppingList/' + id,
            method: 'PUT',
            data: {
                shopping_list_name: text
            }
        });
    });

    $(".add-item").unbind("click").click(function(){
        $(this).closest("div").children(".itemlist").append(newListItem());

        $("#new-list-item").keypress(function(e){
            if(e.keyCode != 13 && e.which != 13)
                return;
            var ul = $(this).closest("ul");
            var text = $(this).val();
            if(text != "") {
                var t = this;
                saveItemToDB($(this).closest("div[data-id]").data("id"), text, ul, function(){
                    $(t).closest("li").remove();
                    addNewItem(ul);
                    setupItemClicks();
                });
            }
            else {
                setupItemClicks();
                $(this).closest("li").remove();
            }
        }).focusout(function(){
            var ul = $(this).closest("ul");
            var text = $(this).val();
            if(text != "") {
                saveItemToDB($(this).closest("div[data-id]").data("id"), text, ul, function(){
                    setupItemClicks();
                });
            }
            $(this).closest("li").remove();
        }).focus();
    });

    $('.pink-select').unbind("click").click(function () {
        var ls = $(this).closest("div[data-id]");
        var id = $(ls).css('background-color', $(this).data('color')).data("id");
        $.ajax({
            url: '/api/shoppingList/' + id,
            method: 'PUT',
            data: {
                color_hex: parseInt(rgb2hex($(ls).css('background-color')).split("#")[1], 16)
            }
        });
    });

    $('.yellow-select').unbind("click").click(function () {
        var ls = $(this).closest("div[data-id]");
        var id = $(ls).css('background-color', $(this).data('color')).data("id");
        $.ajax({
            url: '/api/shoppingList/' + id,
            method: 'PUT',
            data: {
                color_hex: parseInt(rgb2hex($(ls).css('background-color')).split("#")[1], 16)
            }
        });
    });

    $('.green-select').unbind("click").click(function () {
        var ls = $(this).closest("div[data-id]");
        var id = $(ls).css('background-color', $(this).data('color')).data("id");
        $.ajax({
            url: '/api/shoppingList/' + id,
            method: 'PUT',
            data: {
                color_hex: parseInt(rgb2hex($(ls).css('background-color')).split("#")[1], 16)
            }
        });
    });

    $('.white-select').unbind("click").click(function () {
        var ls = $(this).closest("div[data-id]");
        var id = $(ls).css('background-color', $(this).data('color')).data("id");
        $.ajax({
            url: '/api/shoppingList/' + id,
            method: 'PUT',
            data: {
                color_hex: parseInt(rgb2hex($(ls).css('background-color')).split("#")[1], 16)
            }
        });
    });

    $(".fa-money").unbind("click").click(function(){
        var id = $(this).closest("div[data-id]").data("id");
        $.ajax({
            url: '/api/budget/' + id,
            method: 'GET',
            success: function(data){

                curBudget = data;
                var entries = "";
                for(var i = 0; i < data.budget_entries.length; i++){
                    entries += "<tr data-id='" + data.budget_entries[i].budget_entry_id + "'><td>" + data.budget_entries[i].entry_datetime + "</td><td>" + data.budget_entries[i].amount + "</td>";
                }
                $("body").append(balance({
                    title: lang["shop-balance"],
                    complete: lang["shop-ok"],
                    data: "data-id='" + id + "'",
                    lang_trip: lang["shop-trip"],
                    lang_price: lang["shop-price"],
                    budget_entries: entries
                }));

                $('tr[data-id]').click(function(){
                    var id = $(this).closest("tr[data-id]").data("id");
                    var entry = null;
                    for(var i = 0; i < curBudget.budget_entries.length; i++){
                        if(curBudget.budget_entries[i].budget_entry_id == id){
                            entry = curBudget.budget_entries[i];
                        }
                    }
                    if(!entry)
                        return;
                    var d = "<li class='list-group-item'>Work in progress (data about a entry)</li>";
                    $(this).closest(".pop").hide();
                    $("body").append(balanceItem({
                        title: entry.entry_datetime,
                        complete: lang["shop-ok"],
                        list: d
                    }));
                    $("#balance-info-complete").click(function(){
                        $(this).closest(".pop").remove();
                        $(".pop").show();
                    });
                });

                $('#popup-complete').click(function(){
                    $(this).closest(".pop").remove();
                });
            },
            error: console.error
        });
    });

    $(".fa-shopping-cart").unbind("click").click(function(){
        var items = $(this).closest("div").find(".list-group-item input:checked").closest('li[data-id]');
        if(items.length == 0)
            return;
        var entries = $(items[0]).data("id");
        var list = "<li class=\"list-group-item\">" + $(items[0]).html() + "</li>";
        for(var i = 1; i < items.length; i++){
            entries += "," + $(items[i]).data("id");
            list += "<li class=\"list-group-item\">" + $(items[i]).html() + "</li>";
        }
        $("body").append(popupTextList({
            title: lang["shop-buy-title"],
            list: list,
            textfield: lang["shop-buy-text"],
            cancel: lang["shop-cancel"],
            complete: lang["shop-ok"],
            data: "data-id='" + $(this).closest("div[data-id]").data("id") + "' data-entries='" + entries + "'"
        }));

        $(".pop").find(".fa-times").remove();
        $(".pop").find("input[type=checkbox]").remove();

        $("#popup-cancel").click(function(){
            $(this).closest(".pop").remove();
        });

        $("#popup-complete").click(function(){
            if(isNaN(Number($(this).closest('.pop').find('input').val())))
                return;
            var id = $(this).closest("div[data-id]").data("id");
            var e = $(this).closest("div[data-entries]").data("entries");
            if(Number(e) !== e)
                e = e.split(",");
            else
                e = [e];
            $.ajax({
                url: '/api/budget',
                method: 'POST',
                data: {
                    shopping_list_id: currentShoppingList.shopping_list_id,
                    amount: Number($(this).closest('.pop').find('input').val()),
                    text_note: e.join(",")
                },
                success: function(data){
                    for(var i = 0; i < e.length; i++){
                        $.ajax({
                            url: '/api/shoppingList/entry/' + e[i],
                            method: 'PUT',
                            data: {
                                shopping_list_id: currentShoppingList.shopping_list_id,
                                purchased_by_person_id: 2,
                                budget_entry_id: data.budget_entry_id
                            },
                            error: console.error
                        });
                    }
                },
                error: console.error
            });
            for(var i = 0; i < e.length; i++){
                $(".liste").find('li[data-id=' + e[i] + ']').remove();
            }
            $(this).closest(".pop").remove();
        });
    });

    setupItemClicks();
}

/**
 * This function
 */
function setupItemClicks(){
    $(".fa-times").unbind("click").click(function(){
        var entry_id = $(this).closest("li[data-id]").data("id");
        $.ajax({
            url: '/api/shoppingList/entry/' + entry_id,
            method: 'DELETE',
            error: console.error
        });
        $(this).closest("li[data-id]").remove();
    });

    $("li[data-id]").unbind("click").click(function(e){
        if($(this).is('.fa-times'))
            return;
        else if(!$(e.target).is('input')) {
            e.preventDefault();
            $(this).find("input[type=checkbox]").prop('checked', $(this).find("input:checked").length == 0);
        }
    });
}

/**
 * This function lets a user add new items to the shoppinglist.
 * @param ul
 */
function addNewItem(ul){
    $(ul).append(newListItem());

    $("#new-list-item").keypress(function(e){
        if(e.keyCode != 13 && e.which != 13)
            return;
        var ul = $(this).closest("ul");
        var text = $(this).val();
        if(text != "") {
            var t = this;
            saveItemToDB($(this).closest("div[data-id]").data("id"), text, ul, function(){
                $(t).closest("li").remove();
                addNewItem(ul);
                setupItemClicks();
            });
        }
        else {
            setupItemClicks();
            $(this).closest("li").remove();
        }
    }).focusout(function(){
        var ul = $(this).closest("ul");
        var text = $(this).val();
        if(text != "") {
            saveItemToDB($(this).closest("div[data-id]").data("id"), text, ul, function(){
                setupItemClicks();
            });
        }
        $(this).closest("li").remove();
    }).focus();
}


/**
 *This function saves the new items to the database.
 * @param id
 * @param item
 * @param ul
 * @param cb
 */
function saveItemToDB(id, item, ul, cb){
    $.ajax({
        url: '/api/shoppingList/entry',
        method: 'POST',
        data: {
            shopping_list_id: currentShoppingList.shopping_list_id,
            entry_text: item
        },
        success: function(data){
            $(ul).append(listItem({entry_text: item, entry_id: data.shopping_cart_entry_id}));
            if(cb)
                cb();
        }
    });
}

$(function () {
    /**
     * This method posts new posts from a user to a group. Then call
     * the method getPost() to post the post to the page then ClearFields()
     * to reset the inputfield.
     */
    $('#group-postButton').click(function() {



        var formData = new FormData();
        formData.append('File', $("#file-attachment")[0].files[0]);
        formData.append('post_text', $('#group-newsfeedPost').val());
        formData.append('group_id', currentGroup.group_id);
        formData.append('attachment_type', 1);

        $.ajax({
            url : '/api/news',
            type : 'POST',
            data : formData,
            processData: false,
            contentType: false,
            success : function(data) {

                ClearFields();
            }
        });
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
            lang = data;
            for (var p in data) {
                if (data.hasOwnProperty(p)) {
                    $("#" + p).html(data[p]);
                }
            }
        },
        error: console.error
    });

    /**
     * This method calls the language api and sets the language to norwegian
     * if the user clicks on the norwegian flag.
     */
    $('#group-norway').click(function () {
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
            }
        });
    });

    /**
     * This method calls the language api and sets the language to english
     * if the user clicks on the british flag.
     */
    $('#group-england').click(function () {
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
            }
        });
    });

});

/**
 * Method for retrieving all posts for a group, given the group ID
 */

function getPost(){
    $.ajax({
        url:'/api/news/' + currentGroup.group_id,
        method: 'GET',

        success: function (dataFeed) {
            $("#posts").html("");
            for(var i = 0; i < dataFeed.length; i++) {
                var length = 50;
                var text = dataFeed[i].post_text.split(" ");
                var short = "";
                var rest = "";
                for(var j = 0; j < length && j < text.length; j++){
                    short += text[j] + " ";
                }
                for(var k = j; k < text.length; k++){
                    rest += text[k] + " ";
                }
                $("#posts").append(feedPost({
                    name: dataFeed[i].posted_by.forename + (dataFeed[i].posted_by.middlename ? ' ' + dataFeed[i].posted_by.middlename : '') + ' ' + dataFeed[i].posted_by.lastname,
                    payload: ((dataFeed[i].attachment_type === 1) ? '/api/news/data/' + dataFeed[i].post_id : ''),
                    text: short,
                    rest_text: rest,
                    image_url: '/api/user/' + dataFeed[i].posted_by.person_id + '/picture_tiny',
                    data: 'data-id="' + dataFeed[i].post_id + '"',
                    datetime: new Date(dataFeed[i].posted_datetime).toDateString(),
                    lang_read_more: "Read more..."
                }));

                if(k <= length)
                    $("#posts div[data-id=" + dataFeed[i].post_id + "] a").hide();
                else {
                    $("#posts div[data-id=" + dataFeed[i].post_id + "] a").click(function(){

                        $(this).closest("div").find("span").show();
                        $(this).remove();
                    });
                }
            }
        }
    });
}
/**
 * Leave the currently selected group.
 * The page just reloads so that the group is removed from the list.
 */
function leaveGroup() {
    $.ajax({url: '/api/group/' + currentGroup.group_id, method: 'DELETE', error: console.error()});
    location.reload();	// false = from cache, true = from server.
}

/**
 * Statistics for the statistics tab.
 * The month labels will move so that the last column is the current month.
 */
function drawChart() {
	// AJAX get all the budget data for the chart.
	$.ajax({
		type:"GET",
		url:"/api/budget/" + currentGroup.shopping_list_id,
		contentType:"application/json",
		dataType:"json",
		error: function(jqXHR, text, error) {
			hideFirstStat();
			return;
		},
		success:function(result) {
			if (!result) {
				hideFirstStat();
				return;
			}
			if (result.length < 1) {
				hideFirstStat();
				return;
			}
			if (result.budget_entries.length < 0) {
				hideFirstStat();
				return;
			}
			var minLimit = new Date();
			var monthNow = minLimit.getMonth();
			minLimit = minLimit.setFullYear(minLimit.getFullYear() - 1);

			// Insert the values for every month.
			var months = Array(2).fill().map(function(){
				return Array(12).fill(0);
			});
			var validAmount = false;
			for (var i = 0; i < result.budget_entries.length; i++) {
				var element = result.budget_entries[i];
				if (element.entry_datetime != null) {
					var entryTime = new Date(element.entry_datetime);
					if (entryTime > minLimit && element.amount != 0) {
						months[(element.amount > 0) ? 0 : 1][mod(entryTime.getMonth() - monthNow - 1, 12)] += element.amount;
					}
					if (element.amount != 0) {validAmount = true;}
				}
			}
			if (!validAmount) {
				hideFirstStat();
				return;
			}
			else {$('#stat_container').append('<canvas id="stat0" class="chart"></canvas>');}

			// Adjust the labels.
			var labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], rotate = monthNow + 1;
			while (rotate-- > 0) {labels.push(labels.shift());}

			drawBarChart(months, labels, statLabels, statColours, "stat0");
		}
	});
}

/**
 * Statistics for the statistics tab. Can draw in years, months or days.
 * IntervalTypes : 0 = years, 1 = months, 2 = days.
 */
function drawLabelChart(start, end, typeName, intervalType) {
	var min = new Date(start), max = new Date(end);

	// AJAX get all the budget data for the chart.
	$.ajax({
		type: "GET",
		url: "/api/shoppingList/statistic/"+ encodeURIComponent(typeName) +"?group_id="+ currentGroup.group_id +"&start="+ encodeURIComponent(min) +"&end="+ encodeURIComponent(max),
		contentType: "application/json",
		dataType: "json",
		error: function(jqXHR, text, error) {
			if (error == "Bad Request" && jqXHR.responseText == "No data found.") {hideSecondStat();}
			return;
		},
		success: function(result) {
			if (!result) {return;}
			if (!result.length) {return;}
			
			// Insert the values for every interval.
			var dataPoints = [[], []], labels = [], validAmount = false;
			for (var i = 0; i < result.length; i++) {
				var element = result[i], time = new Date(element.t);

				// See if the time is acceptable.
				if (!time || element.amount == 0) {continue;}
				if (time < min || time > max) {continue;}

				var label = "" + time.getFullYear();
				if (intervalType > 0) {label = ((time.getMonth() + 1) + "/") + label;}
				if (intervalType > 1) {label = (time.getDate() + "/") + label;}
				if (element.amount != 0) {validAmount = true;}

				// Add to array if it doesn't already exist, otherwise addition.
				var index = (element.amount > 0) ? 0 : 1, j = checkIfExist(label, labels);
				if (j == -1) {
					labels.push(label);
					dataPoints[index].push(element.amount);
					dataPoints[(index == 0) ? 1 : 0].push(0);
				}
				else {dataPoints[index][j] += element.amount;}
			}
			if (!validAmount) {return;}
			var rgb = ((result[0].colour) ? addInvertedColour(result[0].colour) : statColours);

			$('#stat_container').append('<canvas id="stat1" class="chart"></canvas>');
			drawBarChart(dataPoints, labels, statLabels, ((rgb) ? rgb : statColours), "stat1");
		}
	});
}

/**
* Find if the the element is already added.
*/
function checkIfExist(l, ls) {
	for (var i = 0; i < ls.length; i++) {if (ls[i] == l) {return i;}}
	return -1;
};

/**
 * Draw a "bar" style chart with these labels and the specified data.
 */
function drawBarChart(data, labels, mainLabels, colours, element) {
    // Build the datasets. The default colours are defined at the very top of this file.
    var datasets = [];
    for (var i = 0; i < data.length; i++) {
        datasets.push({
			"label": mainLabels[i],
			"backgroundColor": 'rgba' + colours[i][0],
			"borderColor": 'rgba' + colours[i][1],
			"data":data[i]
		});
    }

    // The Charts.js part.
    var chart = new Chart(document.getElementById(element).getContext("2d"), {
        type: 'bar',
        data: {"labels":labels, "datasets":datasets},
        options: {"barPercentage":0.95, scales: {xAxes: [{stacked: true}], yAxes: [{stacked: true}]}}
    });
	$(element).css('display', 'block');
}

/**
* Create an array with both the inverted and the original in a rgba(r, g, b, a) format.
* This is for the graphs.
*/
function addInvertedColour(colour) {
	var rgb = [];
	if (colour) {
		rgb = [["(", "("], ["(", "("]];
		for (var i = 0; i < 6; i += 2) {
			var colourPart = parseInt(colour.toString(16).slice(i, i + 2), 10);
			var rColourPart = (255 - colourPart) + ", ";
			rgb[0][0] += colourPart + ", ";
			rgb[0][1] += colourPart + ", ";
			rgb[1][0] += rColourPart;
			rgb[1][1] += rColourPart;
		}
		rgb[0][0] += stTransparent + ")";
		rgb[0][1] += "1.0)";
		rgb[1][0] += stTransparent + ")";
		rgb[1][1] += "1.0)";
	}
	return rgb;
}

/**
 * Method to retrieve all tasks given for one group, given the group ID.
 **/

function getTasks() {
    $.ajax({
        url:'/api/tasks/' + currentGroup.group_id,
        method:'GET',
        success: function (data) {
            dataTask = data;
            showCurTasks();
        }
    });
}

function showCurTasks(){
    $('#done-tasks').hide();
    $("#cur-tasks").show();
    $('#cur-tasks .itemlist-task').html("");
    for(var i = 0; i < dataTask.length; i++){
        if(dataTask[i].datetime_done || dataTask[i].is_deactivated)
            continue;
        var d = (dataTask[i].datetime_deadline ? new Date(dataTask[i].datetime_deadline).toISOString().split("T")[0].split('-').join('/') : "");
        console.log(d);
        if(d != ""){
            d = d.split("/");
            d = d[2] + "/" + d[1] + "/" + d[0].substring(2, 4);
        }
        $('#cur-tasks .itemlist-task').append(taskItem({
            todo_id: dataTask[i].todo_id,
            todo_text: dataTask[i].todo_text,
            todo_deadline: d,
            assign_name: (dataTask[i].assigned_to && dataTask[i].assigned_to.forename && dataTask[i].assigned_to.lastname ? dataTask[i].assigned_to.forename + " " + dataTask[i].assigned_to.lastname.substring(0, 1).toUpperCase() + "." : "")
        }));
    }
    $('#cur-tasks .itemlist-task li .fa-check-circle-o').hide();
    setupClicksTask();
}

function showDoneTasks(){
    $('#cur-tasks').hide();
    $("#done-tasks").show();
    $('#done-tasks .itemlist-task').html("");
    for(var i = 0; i < dataTask.length; i++){
        if(!dataTask[i].datetime_done || dataTask[i].is_deactivated)
            continue;

        var d = (dataTask[i].datetime_deadline ? new Date(dataTask[i].datetime_deadline).toISOString().split("T")[0].split('-').join('/') : "");
        if(d != ""){
            d = d.split("/");
            d = d[2] + "/" + d[1] + "/" + d[0].substring(2, 4);
        }
        $('#done-tasks .itemlist-task').append(taskItemDone({
            todo_id: dataTask[i].todo_id,
            todo_text: dataTask[i].todo_text
        }));
    }
    $('#done-tasks .itemlist-task li .fa-circle-o').hide();
    setupClicksTaskDone();
}

/**
 * This function
 */
function setupClicksTask(){
    $(".add-task").unbind("click").click(function(){
        $(this).closest("div").children(".itemlist-task").append(newListItem());
        $("#new-list-item").keypress(function(e){
            if(e.keyCode != 13 && e.which != 13)
                return;
            var ul = $(this).closest("ul");
            var text = $(this).val();
            if(text != "") {
                var t = this;
                saveTaskToDB($(this).closest("div[data-id]").data("id"), text, ul, function(){
                    $(t).closest("li").remove();
                    addNewTask(ul);
                    setupTaskClicks();
                });
            }
            else {
                $(this).closest("li").remove();
                setupTaskClicks();
            }
        }).focusout(function(){
            var ul = $(this).closest("ul");
            var text = $(this).val();
            if(text != "") {
                saveTaskToDB($(this).closest("div[data-id]").data("id"), text, ul, function(){
                    setupTaskClicks();
                });
            }
            $(this).closest("li").remove();
        }).focus();
    });

    $('.fa-list-ul').unbind('click').click(function(){
        showDoneTasks();
    });
    setupTaskClicks();
}

/**
 * This function
 */
function setupClicksTaskDone(){
    $('.fa-list-ul').unbind('click').click(function(){
        showCurTasks();
    });
    setupTaskClicksDone();
}

/**
 * This function adds a new task to the list when enter is pressed
 * @param ul
 */
function addNewTask(ul){
    $("#cur-tasks").find(".itemlist-task").append(newListItem());
    $("#new-list-item").keypress(function(e){
        if(e.keyCode != 13 && e.which != 13)
            return;
        var ul = $(this).closest("ul");
        var text = $(this).val();
        if(text != "") {
            var t = this;
            saveTaskToDB($(this).closest("div[data-id]").data("id"), text, ul, function(){
                $(t).closest("li").remove();
                addNewTask(ul);
                setupTaskClicks();
            });
        }
        else {
            setupTaskClicks();
            $(this).closest("li").remove();
        }
    }).focusout(function(e){
        var ul = $(this).closest("ul");
        var text = $(this).val();
        if(text != "") {
            saveTaskToDB($(this).closest("div[data-id]").data("id"), text, ul, function(){
                setupTaskClicks();
            });
        }
        $(this).closest("li").remove();
    }).focus();
}

/**
 * This function saves the new tasks to the database.
 * @param id
 * @param item
 * @param ul
 * @param cb
 */
function saveTaskToDB(id, item, ul, cb){
    $.ajax({
        url: '/api/tasks/',
        method: 'POST',
        data: {
            group_id: currentGroup.group_id,
            todo_text: item
        },
        success: function(data){
            if(cb)
                cb();
        }
    });
}

/**
 * This function
 */
function setupTaskClicks(){
    $(".fa-times").unbind("click").click(function(){
        var entry_id = $(this).closest("li[data-id]").data("id");
        $.ajax({
            url: '/api/tasks/todo/' + entry_id,
            method: 'DELETE',
            error: console.error
        });
    });

    $(".datepicker").datepicker({
        //dateFormat: 'DD, mm-y'
        dateFormat: 'dd/mm/y',
        onSelect: function() {
            var d = $(this).val();
            if(d != ""){
                d = d.split("/");
                d = d[2] + "-" + d[1] + "-" + d[0];
            }
            $.ajax({
                url: '/api/tasks/' + $(this).closest("li[data-id]").data('id'),
                method: 'PUT',
                data: {
                    datetime_deadline: (d == "" ? "NULL" : d)
                },
                error: console.error
            });
        }
    });
    //Hides elements yet to be shown
    $('input.datepicker').filter(function() { return this.value === ""; }).hide();
    $('.checked').hide();

    $('.fa-calendar').unbind('click').click(function () {
        var datepicker = $(this).parent().find(".datepicker");
        $(datepicker).css('background-color: white');
        if(datepicker.is(":visible")){
            if($(datepicker).val() == "")
                datepicker.hide();
            else if(datepicker.is(':focus'))
                datepicker.blur();
            else
                datepicker.focus();
        }
        else{
            datepicker.show();
            datepicker.focus();
        }
    });

    $('li[data-id]').unbind("click").click(function(e){
        if($(e.target).hasClass("fa") || $(e.target).hasClass("datepicker"))
            return;
        var id = $(this).data("id");
        $.ajax({
            url: '/api/tasks/' + id + '/done',
            method: 'PUT'
        });
    });

    $('.fa-user').unbind('click').click(addMembersPopup);
}

function setupTaskClicksDone(){
    $(".fa-times").unbind("click").click(function(){
        var entry_id = $(this).closest("li[data-id]").data("id");
        $.ajax({
            url: '/api/tasks/todo/' + entry_id,
            method: 'DELETE',
            error: console.error
        });
    });

    $('.checked').hide();

    $('li[data-id]').unbind("click").click(function(){
        var id = $(this).data("id");
        $.ajax({
            url: '/api/tasks/' + id + '/undo',
            method: 'PUT'
        });
    });
}

/**
 * Javascript modulo math is a LIE.
 */
function mod(n, m) {
    return ((n % m) + m) % m;
}

/**
 * This function makes it possible for a user to logout when on the groups page.
 */
$('#group-logoutNavbar').click(function () {
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

function getCalendar() {
    $('#calendar').fullCalendar({
        height: 510,
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay,listWeek'
        },
        defaultDate: '2017-12-12',
        navLinks: true, // can click day/week names to navigate views
        editable: true,
        eventLimit: true, // allow "more" links when too many events
        events: [
            {
                title: 'All Day Event',
                start: '2017-12-01',
            }
        ]
    });
}

/**
* Create the options in the drop down with the entry types.
*/
function createLabelOptions() {
	// AJAX get all the budget entry names available.
	$.ajax({
		type:"GET",
		url:"/api/budget/entryType?shopping_list_id=" + currentGroup.shopping_list_id,
		contentType:"application/json",
		dataType:"json",
		error: function(jqXHR, text, error) {return;},
		success:function(result) {
			if (!result) {return;}
			var types = result.budget_entry_types;
			if (types.length < 1) {hideSecondStat();}
			else {
				for (var i = 0; i < types.length; i++) {
					var found = false, current = types[i].entry_type_name;
					$("#entry_types option").each(function() {if ($(this).html() == current) {found = true;}});
					if (!found) {$("#entry_types").append('<option>' + current + '</option>');}
				}
				showSecondStat();
			}
		}
	});
}


function hideFirstStat() {
	$("#stat0").css('display', 'none');
	$("#stat_header").css('display', 'none');
	$('#stat0').remove();
}

function showFirstStat() {
	
	$('#stat_container').append('<canvas id="stat0" class="chart"></canvas>');
	$("#stat0").css('display', 'block');
	$("#stat_header").css('display', 'block');
}

function hideSecondStat() {
	$("#showStat").hide();
	$("#entry_types").hide();
	$("#stat1").css('display', 'none');
	$("#date_start").hide();
	$("#date_end").hide();
	$("#time_types").hide();
	$("#ds_label").hide();
	$("#de_label").hide();
	$('#stat0').remove();
}

function showSecondStat() {
	$('#stat_container').append('<canvas id="stat0" class="chart"></canvas>');
	$("#showStat").show();
	$("#entry_types").show();
	$("#stat1").css('display', 'block');
	$("#date_start").show();
	$("#date_end").show();
	$("#time_types").show();
	$("#ds_label").show();
	$("#de_label").show();
}

function drawStats() {
	$('#stat1').remove();
	drawLabelChart($("#date_start").datepicker('getDate'), $("#date_end").datepicker('getDate'), $("#entry_types").val(), $("#time_types option:selected").index());
	hideFirstStat();
}

function addMembersPopup(){
    var themember;
    //Shows suggestions when characters is typed
    $('#scrollable-dropdown-menu3 .typeahead').typeahead({
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
                prefetch: '/api/user/all/' + currentGroup.group_id
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

    //Adds member to list when clicked
    $(".typeahead").bind('typeahead:select', function(a, data){
        themember = data;
        $(".typeahead").val("");
    });

    //Empty inputfield when its closed
    $(".typeahead").bind('typeahead:close', function(){
        $(".typeahead").val("");
    });

    $('body').append(popupAssign({
        assign_header: lang["assign-header"],
        assign_name: lang["assign-name"],
        assign_ok: lang["assign-ok"],
        assign_cancel: lang["assign-cancel"]
    }));

    $('.assignok').unbind("click").click(function () {
        var personid = '';
        var personids = [];
        personids.push(personid);
        var todoid = $(this).closest('div[data-id]').data('id');
        $.ajax({
            url: '/api/tasks/person/'+todoid,
            method: 'POST',
            data: {
                people: personids
            }
        })
    });

    $('.assigncancel').unbind("click").click(function () {
        $('.pop').remove();
    });
}