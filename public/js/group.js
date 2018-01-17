// ***** Temporary test variables - delete this section when no longer needed *****
var grouplist;
var person = "Person";

// ***** Code begins here *****

var activeTab = "tasks", currentGroup;

/**
* When the page loads, the page must find the groups available to the user so they can be selected.
*/
$(document).ready(function() {

	$.ajax({
		url:'/api/group/me',
		method:'GET',
		success: function (data) {
			grouplist = data;
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
				if(activeTab=='shopping') {
					getShoppinglist();
				}
			});
		},
		error: console.error()
	});

	loadLanguageText();
	//getGroups();
	
	var groups = $("div.tablink");
	if (groups.length > 0) {changeGroup($(groups[0]).html());}
	
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
	if (activeTab != name) {
		var tabs = $(".grouptab");
		for (var i = 0; i < tabs.length; i++) {tabs[i].style.display = "none";}
		$("#" + name).css("display", "block");
		activeTab = name;
	}
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


function getShoppinglist() {
		$.ajax({
			url: "/api/shoppingList/" + currentGroup.shopping_list_id,
			method: "GET",
			success: function (data) {
				var list = data.shopping_list_entries;
				var h = "";
				for (var i = 0; i < list.length; i++) {
					h += "<br>" + list[i].entry_text;
					console.log(h);
				}
				$("#items-shoppinglist").html(h);
			}
		});
}

$(function () {
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
