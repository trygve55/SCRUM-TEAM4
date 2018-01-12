// ***** Temporary test variables - delete this section when no longer needed *****

var person = "Person";
var testtasks = {
	"tasks":[
		{"name":"Task A", "person":"Person", "completed":0, "time":"11/11/2011"}, 
		{"name":"Task B", "person":"Someone", "completed":0, "time":"12/12/2012"},
		{"name":"Task C", "person":"None", "completed":1, "time":"13/13/2013"}
	]
};

// ***** Code begins here *****

var activeTab = "tasks", currentGroup = "none";

/**
* When the page loads, the page must find the groups available to the user so they can be selected.
*/
$(document).ready(function() {
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
	// AJAX GET all text in this language.
	var response;
	$.ajax({
		type:"GET",
		url:"/api/language",
		contentType:"application/json",
		dataType:"json",
		success:function(result) {
		    response = result;
            for (var p in response) {$("#" + p).html(response[p]);}
		}
	});
		// Temporary, remove when using the AJAX
	
	for (var p in response) {$("#" + p).html(response[p]);}
	
	/*
	// Alternative, probably slower.
	$(".langtext").each(function() {
		$(this).html(response[this.id]);
	});
	*/
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
	for (i = 0; i < names.length; i++) {addGroupToList(names[i]);}
	removeDeletedGroups(names);
}

/**
* When the user clicks on a tab, load and show the information within, and hide any other tabs.
*/
function changeTab(name) {
	if (activeTab != name) {
		var tabs = $(".grouptab");
		for (i = 0; i < tabs.length; i++) {tabs[i].style.display = "none";}
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
function addGroupToList(name) {
	var groups = $(".tablink");
	for (i = 0; i < groups.length; i++) {if ($(groups[i]).html() == name) {return;}}
	$("#groupselection").append('<div class="tablink text-center backvariant" onclick="changeGroup(\'' + name + '\')">' + name + '</div>');
}

/**
* Delete any groups which are no longer available to this user.
*/
function removeDeletedGroups(validNames) {
	$(".tablink").each(function() {
		var exists = false;
		for (i = 0; i < validNames.length; i++) {if ($(this).html() == validNames[i]) {exists = true;}}
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
	for (i = 0; i < tasks.length; i++) {
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
