var activeTab = "tasks", currentGroup = "none";

$(document).ready(function() {
	var groups = $("div.tablink");
	if (groups.length > 0) {changeGroup($(groups[0]).html());}
	
	// TEST
	addGroupToList("Group E");
	addGroupToList("Group 1");
});

function changeTab(name) {
	if (activeTab != name) {
		var tabs = $(".grouptab"), i;
		for (i = 0; i < tabs.length; i++) {tabs[i].style.display = "none";}
		$("#" + name).css("display", "block");
		activeTab = name;
	}
}

function changeGroup(name) {
	if (currentGroup != name) {
		$("title").html(name);
		currentGroup = name;
		loadGroup(name);
	}
}

function loadGroup(name) {
	// LOAD GROUP INFO AJAX
	/*
	var response;
	$.ajax({
		type:"GET",
		url:"",
		contentType:"application/json",
		dataType:"json",
		success:function(result) {response = result;}
	});	// GET all data for this group.
	*/
	// PUT ALL THE DATA ON THE PAGE
}

function addGroupToList(name) {
	var groups = $(".tablink"), i;
	for (i = 0; i < groups.length; i++) {if ($(groups[i]).html() == name) {return;}}
	$("#groupselection").append('<div class="tablink text-center" onclick="changeGroup(\'' + name + '\')">' + name + '</div>');
}

