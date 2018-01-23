// ***** Temporary test variables - delete this section when no longer needed *****
var person = "Person";


var activeTab = "feed", currentGroup, listItem, newListItem, balance, balanceItem, popupTextList, currentShoppingList, feedPost, readMore;
var statColours = [["(0, 30, 170, 0.5)", "(0, 0, 132, 1)"], ["(170, 30, 0, 0.5)", "(132, 0, 0, 1)"]], statLabels = ["Income", "Expenses"];

/**
* When the page loads, the page must find the groups available to the user so they can be selected.
*/
$(document).ready(function() {
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
                'newsfeedPost.html'
            ]
        },
        success: function (data){
            listItem = Handlebars.compile(data['listItem.html']);
            newListItem = Handlebars.compile(data['newListItem.html']);
            balance = Handlebars.compile(data['balance.html']);
            balanceItem = Handlebars.compile(data['balanceItem.html']);
            popupTextList = Handlebars.compile(data['popupTextfieldList.html']);
            feedPost = Handlebars.compile(data['newsfeedPost.html']);
        }
    });

	$.ajax({
		url:'/api/group/me',
		method:'GET',
		success: function (data) {
			var grouplist = data;
			console.log(data);
			currentGroup = data[0];
			for(var i = 0; i < data.length; i++){
				addGroupToList(data[i]);
			}
			$(".group").click(function(){
				$('#groupwindow').show();
				currentGroup = $(this).data("group-id");
				console.log(currentGroup);
				for(var i = 0; i < grouplist.length; i++) {
					if (currentGroup == grouplist[i].group_id){
						currentGroup = grouplist[i];
						break;
					}
				}
				console.log(activeTab);
				changeTab();
			});
		},
		error: console.error()
	});

	loadLanguageText();
	
	//var groups = $("div.tablink");
	//if (groups.length > 0) {changeGroup($(groups[0]).html());}
	
	// TEST
	//addGroupToList("Group E");
	//addGroupToList("Group 1");
	//attachTasks(testtasks.tasks);
	
	// Add some updating system here.
	
	//window.setInterval(getGroups, 5000);	// Every 5 seconds the groups will be loaded.

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
                if(result.hasOwnProperty(p))
                    $("#" + p).html(result[p]);
            }
		}
	});
}

function ClearFields() {
    document.getElementById("group-newsfeedPost").value = "";
}

/**
* Get all the groups this user can access.
* This is a separate function so it can be run when the number of groups change.
*/
function getGroups() {
	var response;
	// AJAX GET all groups available to user.
	//.get("URL", function(result){response = result});
	/*$.ajax({
		type:"GET",
		url:"URL",
		contentType:"application/json",
		dataType:"json",
		success:function(result) {response = result;}
	});	// GET all group names for this user.
	*/
	var names = response.groupnames;
	for (var i = 0; i < names.length; i++) {
		addGroupToList(names[i]);
	}
	removeDeletedGroups(names);
}

/**
* When the user clicks on a tab, load and show the information within, and hide any other tabs.
*/
function changeTab(name) {
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
    //else if(activeTab=='tasks')

    else if (activeTab == 'statistics')
        drawChart();
}

/**
* When the user clicks on a group, load it and show the content.
*/
function changeGroup(name) {
	if (currentGroup != name) {
		$("title").html(name);
		currentGroup = name;
		loadGroup(name);
	}
}

/**
* After a group is clicked, it will be loaded. Only one is loaded at a time so that
* it can appear faster.
*/
function loadGroup(name) {
	// LOAD GROUP INFO AJAX
	
	var response;
	/*$.ajax({
		type:"GET",
		url:"",
		contentType:"application/json",
		dataType:"json",
		success:function(result) {response = result;}
	});	// GET all data for this group.
	*/
	// PUT ALL THE DATA ON THE PAGE
	//attachTasks(result.youtasks);
	
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

/*
function registerGroupForSystem() {} // AJAX Post the new group.
function postNewTask() {} // AJAX Post the new task.
function postNewPost() {} // AJAX Post the new post.
function addNewLsit() {} // AJAX Post the new shopping list.
function loadStatistics() {} // AJAX Get the group statistics.
*/

/**
* This adds the HTML elements for the task.
*/
function attachTasks(tasks) {
	for (var i = 0; i < tasks.length; i++) {
		var task = tasks[i];
		if (!task.completed) {
			if (person = task.person) {
				$("#yourtasks").append(
					'<div class="chbox"><input type="checkbox" value=""><p>' + task.name + '</p></div>'
				);
			}
			$("#grouptasks").append(
				'<div class="task"><input type="checkbox" value=""><p>' + task.name + ' - ' + task.person + ' - ' + task.time + '</p></div>'
			); // The format here is just temporary. Change if something better gets decided.
		}
	}
}

//function countNewPosts() {} // From last login date, display a number of new posts
//function countNewTasks() {} // From last login date, display a number of new tasks


function addGroup(){
    $('#addGroup-button').click(
        window.location = 'addGroup.html'
    )
}

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

function getTasksWindow() {
    $.ajax({
        url: '/api/tasks' + currentGroup.group_id,
        method: 'GET',
        success: function (dataTask) {
            console.log(dataTask);
            setupTasks();
        }
    })
}

function getTasks() {
    $.ajax({
        url: "/api/tasks/person/",
        method: 'GET',
        success: function (dataperson) {
            console.log(dataperson);
        }
    })
}



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
                console.log(data);
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
    $('#group-postButton').click(function() {
        console.log('hei');
        $.ajax({
            url: '/api/news',
            method: 'POST',
            data: {
                post_text: $('#group-newsfeedPost').val(),
                group_id: currentGroup.group_id
            },
            success: function (data123) {
                console.log(data123);
                getPost();
                ClearFields();
            }
        })

    });


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
                console.log(dataFeed);
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
                a = new Date(dataFeed[i].posted_datetime);
                testy = a.toDateString();
                $("#posts").append(feedPost({
                    name: dataFeed[i].posted_by.forename + (dataFeed[i].posted_by.middlename ? ' ' + dataFeed[i].posted_by.middlename : '') + ' ' + dataFeed[i].posted_by.lastname,
                    payload: '',
                    text: short,
                    rest_text: rest,
                    image_url: (dataFeed[i].attachment_type == 0 ? '/img/profilPicture.png' : ''),
                    data: 'data-id="' + dataFeed[i].post_id + '"',
                    datetime: testy,
                    lang_read_more: "Read more..."
                }));
                console.log(j);
                if(k <= length)
                    $("#posts div[data-id=" + dataFeed[i].post_id + "] a").hide();
                else {
                    $("#posts div[data-id=" + dataFeed[i].post_id + "] a").click(function(){
                        console.log("HEI");
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
		success:function(result) {
			if (result) {
				var minLimit = new Date();
				var monthNow = minLimit.getMonth();
				minLimit = minLimit.setFullYear(minLimit.getFullYear() - 1);
				
				// Insert the values for every month.
				//var months = Array(2).fill().map(() => Array(12).fill(0));
				for (var i = 0; i < result.budget_entries.length; i++) {
					var element = result.budget_entries[i];
					if (element.entry_datetime != null) {
						var entryTime = new Date(element.entry_datetime);
						var entryMonth = mod(entryTime.getMonth() - monthNow - 1, 12);	// Perferably test the mod more.
						if (entryTime > minLimit) {
							if (element.amount > 0) {months[0][entryMonth] += element.amount;}
							else {months[1][entryMonth] += element.amount;}
						}
					}
				}
				
				// Adjust the labels.
				var labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], rotate = monthNow + 1;
				while (rotate-- > 0) {labels.push(labels.shift());}
				
				drawBarChart(months, labels);
			}
		}
	});
}

/** START GET TASKS FOR GROUP */
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
                saveItemToDB($(this).closest("div[data-id]").data("id"), text, ul, function(){
                    $(t).closest("li").remove();
                    addNewTask(ul);
                    setupTaskClicks();
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
                    setupTaskClicks();
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

}

function addNewTask(ul){
    $(ul).append(newListItem());

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
}

function saveTaskToDB(id, item, ul, cb){
    $.ajax({
        url: '/api/tasks/',
        method: 'POST',
        data: {

        },
        success: function(data){
            $(ul).append(listItem({entry_text: item, entry_id: data.shopping_cart_entry_id}));
            if(cb)
                cb();
        }
    });
}

function setupTaskClicks(){
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
* Draw a "bar" style chart with these labels and the specified data.
*/
function drawBarChart(data, labels) {
	// Build the datasets. The colours are defined at the very top of this file.
	var datasets = [];
	for (var i = 0; i < data.length; i++) {
		datasets.push({"label": statLabels[i], "backgroundColor": 'rgba' + statColours[i][0], "borderColor": 'rgba' + statColours[i][1], "data":data[i]});
	}
	
	// The Charts.js part.
	var chart = new Chart(document.getElementById("stat0").getContext("2d"), {
		type: 'bar',
		data: {"labels":labels, "datasets":datasets},
		options: {"barPercentage":0.95, scales: {xAxes: [{stacked: true}], yAxes: [{stacked: true}]}}
	});
}

/**
* Javascript modulo math is a LIE.
*/
function mod(n, m) {
    return ((n % m) + m) % m;
};
