
var stTransparent = "0.5",
	statColours = [["(0, 30, 170, " + stTransparent + ")", "(0, 0, 132, 1)"], ["(170, 30, 0, " + stTransparent + ")", "(132, 0, 0, 1)"]],
	statLabels = ["Income", "Expenses"];
const MILLIS_DAY = 86400000;
var activeTab = "feed", currentGroup, listItem, newListItem, balance, balanceItem, popupTextList, currentShoppingList, feedPost, readMore, taskItem, dataTask = [], taskItemDone, popupAssign, listMemebers, listMemebersAdmin, adminView, adminViewSimple, groupShopping;
var statColours = [["(0, 30, 170, 0.5)", "(0, 0, 132, 1)"], ["(170, 30, 0, 0.5)", "(132, 0, 0, 1)"]], statLabels = ["Income", "Expenses"];
var generalLabels, grouplist;
var lang;

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
            datetime: new Date(data[i].posted_datetime).toDateString(),
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

socket.on('group invite accept', function(data){
    grouplist.concat(data);
    for(var i = 0; i < grouplist.length; i++){
        if(!grouplist[i].group_deactivated)
        addGroupToList(grouplist[i]);
    }
});

function updateLang(){
    for (var p in lang) {
        if (lang.hasOwnProperty(p)) {
            $("#" + p).html(lang[p]);
        }
    }
    generalLabels = [lang["shop-new-label"], lang["label-party"], lang["label-food"], lang["label-clean"], lang["label-repairs"]];
}

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
                'balanceClean.html',
                'balanceItem.html',
                'popupTextfieldList.html',
                'newsfeedPost.html',
                'taskItem.html',
                'taskListGroup.html',
                'taskItemDone.html',
                'popupAssign.html',
                'listMemebers.html',
                'listMemebersAdmin.html',
                'adminView.html',
                'adminViewSimple.html',
                'groupShopping.html'
            ]
        },
        success: function (data){
            listItem = Handlebars.compile(data['listItem.html']);
            newListItem = Handlebars.compile(data['newListItem.html']);
            balance = Handlebars.compile(data['balanceClean.html']);
            balanceItem = Handlebars.compile(data['balanceItem.html']);
            popupTextList = Handlebars.compile(data['popupTextfieldList.html']);
            feedPost = Handlebars.compile(data['newsfeedPost.html']);
            taskItem = Handlebars.compile(data['taskItem.html']);
            taskListGroup = Handlebars.compile(data['taskListGroup.html']);
            taskItemDone = Handlebars.compile(data['taskItemDone.html']);
            popupAssign = Handlebars.compile(data['popupAssign.html']);
            listMemebers = Handlebars.compile(data['listMemebers.html']);
            listMemebersAdmin = Handlebars.compile(data['listMemebersAdmin.html']);
            adminView = Handlebars.compile(data['adminView.html']);
            adminViewSimple = Handlebars.compile(data['adminViewSimple.html']);
            groupShopping = Handlebars.compile(data['groupShopping.html']);
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
			grouplist = data;

			currentGroup = data[0];
			for(var i = 0; i < data.length; i++){
				addGroupToList(data[i]);
			}
			$(".group").click(function(){
                if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                    $("html, body").animate({ scrollTop: $(document).height() }, "slow");
                }
                $("#oda").html("<div id='calendar'></div>");
			    $('#groupwindowStart').hide();
                $(".group").removeClass("aktiv");
                $(this).addClass("aktiv");
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
            lang = result;
            for (var p in result) {
                if(result.hasOwnProperty(p)) {
                    $("#" + p).html(result[p]);
                    $("." + p).html(result[p]);
                }
            }
            generalLabels = [result["label-party"], result["label-food"], result["label-clean"], result["label-repairs"]];
        }
    });
}

/**
 * This method clears the feed post inputfield when user press the post-button
 */
function ClearFields() {
    document.getElementById("group-newsfeedPost").value = "";
    $("input[type=file]").val("");
}

/**
 * When the user clicks on a tab, load and show the information within, and hide any other tabs.
 */
function changeTab(name) {
	$('#stat0').remove();
	$('#stat1').remove();
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
    else if (activeTab == 'leave')
        adminChange();
    else if(activeTab == 'food')
        getCalendar();
}


function adminChange() {
    $('#changegroup-NameButton').click(function () {
        $.ajax({
            url: '/api/group/' + currentGroup.group_id,
            method: 'PUT',
            data: {
                group_name: $('#changegroup_Name').val()
            },
            success: function () {
                location.reload();
            },
            error: console.error()
        });
    });


    $.ajax({
        url: '/api/group/' + currentGroup.group_id + '/me/privileges',
        method: 'GET',
        success: function (priv) {
            $.ajax({
                url: '/api/group/' + currentGroup.group_id + '/privileges',
                method: 'GET',
                success: function (datz) {
                    for( var j = 0; j < datz.length; j++){
                        var privz = [];
                        privz.push(datz[j])
                    }
                    $.ajax({
                        url: '/api/group/' + currentGroup.group_id + '/users',
                        method: 'GET',
                        success: function (data) {
                            if(priv) {
                                $("#leave").html(adminView({
                                    changenameofgroup: lang["changenameofgroup"],
                                    memebersofgroup: lang["memebersofgroup"],
                                    changegroupNameButton: lang["changegroupNameButton"],
                                    addmembers: lang["addmembers"],
                                    deletegroup: lang["deletegroup"],
                                    leaveGroup: lang["leaveGroup"]
                                }));
                                $("#leaveGroup").click(leaveGroup);
                                $("#typeing-members .typeahead").typeahead({
                                        highlight: true
                                    },
                                    {
                                        name: 'user-names',
                                        display: 'name',
                                        source: new Bloodhound({
                                            datumTokenizer: function(d){
                                                for(var i = 0; i < data.length; i++){
                                                    if(d.id == data[i].person_id)
                                                        return [];
                                                }
                                                return Bloodhound.tokenizers.whitespace(d.name).concat([d.email]);
                                            },
                                            queryTokenizer: Bloodhound.tokenizers.whitespace,
                                            prefetch: {
                                                url: '/api/user/all?slim=1',
                                                cache: false
                                            }
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
                                    console.log(data);
                                    $.ajax({
                                        url: '/api/group/' + currentGroup.group_id + '/members',
                                        method: 'POST',
                                        data: {
                                            members: [
                                                data.id
                                            ]
                                        },
                                        success: function(data){
                                            $('#list-all-members').append(listMemebersAdmin({
                                                member_text: data.forename + " " + data.lastname,
                                                member_id: data.person_id
                                            }));
                                        },
                                        error: console.error
                                    });
                                    $(".typeahead").val("");
                                });

                                //Empty inputfield when its closed
                                $(".typeahead").bind('typeahead:close', function(){
                                    $(".typeahead").val("");
                                });
                            }
                            else
                                $("#leave").html(adminViewSimple({
                                    changenameofgroup: lang["changenameofgroup"],
                                    memebersofgroup: lang["memebersofgroup"],
                                    changegroupNameButton: lang["changegroupNameButton"],
                                    addmembers: lang["addmembers"],
                                    deletegroup: lang["deletegroup"],
                                    leaveinggroup: lang["leaveinggroup"],
                                    leaveGroupButton: lang["leaveGroupButton"],
                                    leaveGroup: lang["leaveGroup"]

                                }));
                            for (var i = 0; i < data.length; i++) {
                                if (priv) {
                                    $('#list-all-members').append(listMemebersAdmin({
                                        member_text: data[i].name,
                                        member_id: data[i].person_id
                                    }));

                                } else {
                                    $('#list-all-members').append(listMemebers({
                                        memebersofgroup: lang["memebersofgroup"],
                                        member_text: data[i].name,
                                        member_id: data[i].person_id
                                    }));
                                    $('#membersofgroup').css('margin-left', '20%').css('padding', '5%');
                                }

                            }

                        }
                    })
                }

            })
        }

    });
}

/**
 * This function allows a admin to delete a group.
 */

function deleteGroup(){
    var antUsers = [];
    $.ajax({
        url:  '/api/group/' + currentGroup.group_id + '/users',
        method: 'GET',
        success: function (data) {
            for(var i = 0; i < data.length; i++) {
                antUsers.push(data[i].person_id);
            }
            $.ajax({
                url:'/api/group/' + currentGroup.group_id,
                method: 'DELETE',
                data: {
                  person_id: antUsers
                },
                success: function () {
                    console.log('We gooood');
                    location.reload();
                }
            })
        }
    })
}

/**
 * Leave the currently selected group.
 * The page just reloads so that the group is removed from the list.
 */


function leaveGroup() {
    $.ajax({
        url: '/api/group/' + currentGroup.group_id,
        method: 'DELETE',
        data:{
          person_id: localStorage.person_id
        },
        success: function () {
            location.reload();
        },
        error: console.error
    });
}

/**
 * When a group is created, it must be added to the list.
 */

function addGroupToList(group) {
    var groups = $(".tablink");
    for (var i = 0; i < groups.length; i++) {
        if ($(groups[i]).html() == group.group_name) return;
    }
    if (group.invite_accepted) $("#thelistgroup").append('<li class="list-group-item tablink group"  data-group-id="' + group.group_id + '">' + group.group_name + '</li>');
    //$("#groupselection").append('<div style="padding-top: 2px; height: 30px; border-radius: 10px; background-color: white; -moz-box-shadow: inset 0 0 3px grey; -webkit-box-shadow: inset 0 0 3px grey; box-shadow: inset 0 0 3px grey;" class="tablink text-center backvariant group" data-group-id="' + group.group_id + '">' + group.group_name + '</div><h4></h4>');
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
            $('#shopping').children().html(groupShopping());
            updateLang();
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

    $(".money").unbind("click").click(function(){
        var id = currentShoppingList.shopping_list_id;
        var sign = "";
        var place = -1;
        for(var j=0; j<currentShoppingList.length; j++){
            if(currentShoppingList[j].shopping_list_id==id){
                sign = currentShoppingList[j].currency_sign;
                place=j;
            }
        }
        $.ajax({
            url: '/api/budget/' + id,
            method: 'GET',
            success: function(data){
                curBudget = data;
                var entries = "";

                /**
                 * This method adds all budget-entries to the list
                 */
                for(var i = data.budget.length-1; i >= 0 ; i--){
                    entries += "<tr data-id='" + data.budget[i].budget_entry_id + "'><td>" + data.budget[i].text_note +"</td><td>" + data.budget[i].amount/100 + " "+sign+"</td>";
                }


                var oeM = '';
                var oeB = '';
                var balancelist = curBudget.my_balance;

                for(var i=0; i<balancelist.length; i++){
                    var name = balancelist[i].forename + " " + balancelist[i].lastname;
                    var numb = balancelist[i].amount/100;
                    if(numb < 0){
                        oeM += "<tr  class='balancelist minus'><td>" + name +"</td><td>" + numb + " "+sign+"</td>";
                    }else{
                        oeB += "<tr class='balancelist plus'><td>" + name +"</td><td>" + numb + " "+sign+"</td>";
                    }
                }
                var oe = oeM + oeB;

                $('#shopping').children().html(balance({
                    title: lang["shop-balance"],
                    bal_complete: lang["bal-ok"],
                    lang_trip: lang["shop-trip"],
                    lang_price: lang["shop-price"],
                    lang_name: lang["lang-name"],
                    lang_owe: lang["lang-owe"],
                    owe_entries: oe,
                    lang_settle: lang["lang-settle"],
                    budget_entries: entries
                }));


                $('.balancelist').unbind("click").click(function () {
                    var name = this.innerHTML.split('>')[1].split('<')[0];
                    for(var j=0; j<balancelist.length; j++){
                        var thefullname = balancelist[j].forename + " " + balancelist[j].lastname;
                        var personid = balancelist[j].person_id;
                        if(thefullname == name){
                            if(balancelist[j].amount <= 0) {
                                break;
                            }
                            var thelist = balancelist[j];
                            var budgetids = thelist.budget_entry_ids;
                            console.log(budgetids);
                            var arr = thelist.budget_entry_ids;
                            st = lang["settle-text-one"] + thefullname + lang["settle-text-two"] + this.innerHTML.split(">")[3].split("<")[0].replace("-", "");
                            $('body').append(popupSettle({
                                settle_text: st,
                                settle_yes: lang["settle-yes"],
                                settle_no: lang["settle-no"]
                            }));
                            var arrayString = arr.join(",");
                            console.log(arr);
                            console.log(arrayString);
                            $('.btn-success').unbind("click").click(function () {
                                var suc = this;
                                $.ajax({
                                    url: 'api/budget/pay',
                                    method: 'PUT',
                                    contentType: 'application/json',
                                    data: JSON.stringify({
                                        budget_entry_ids: arrayString,
                                        person_id: personid
                                    }),
                                    error: console.error,
                                    success: function (data) {
                                        $(suc).closest('.pop').remove();
                                    }
                                })
                            });
                            $('.btn-danger').unbind("click").click(function () {
                                $(this).closest('.pop').remove();
                            });
                        }
                    }

                });

                /**
                 * This method opens a popup when a budget-entry is clicked.
                 */
                $('tr[data-id]').click(function(){
                    var id = $(this).closest("tr[data-id]").data("id");
                    var entry = null;
                    for(var i = 0; i < curBudget.budget.length; i++){
                        if(curBudget.budget[i].budget_entry_id == id){
                            entry = curBudget.budget[i];
                            break;
                        }
                    }
                    if(!entry)
                        return;
                    var entrylist = entry.shopping_list_entries;
                    var g = "";
                    for(var j=0; j<entrylist.length; j++){
                        g += "<li class='list-group-item'>"+entrylist[j].entry_text+"</li>";
                    }
                    var p = "";
                    var payerlist = entry.persons_to_pay;
                    for(var k=0; k<payerlist.length; k++){
                        var temp = '';
                        if(payerlist[k].datetime_paid!=null){
                            temp = '<i class="fa fa-check" aria-hidden="true"></i>';
                        }
                        if(payerlist[k].person_id == me.person_id){
                            p += "<tr><td>"+lang["me"]+"</td><td style='text-align: center'>"+temp+"</td></tr>";
                        }else{
                            p += "<tr><td>"+payerlist[k].forename+" "+payerlist[k].lastname+"</td><td>"+temp+"</td></tr>";
                        }
                    }
                    $(this).closest(".pop").hide();
                    var datetime = entry.entry_datetime;
                    var year = datetime.split("-")[0]; //2018
                    var month = datetime.split("-")[1]; //01
                    var date = datetime.split("-")[2].split("T")[0]; //23
                    var time = datetime.split("T")[1].split(".")[0]; //09:23:02
                    var timeNsec = time.split(":")[0] + ":" + time.split(":")[1];
                    var formattedDateTime = date + "/" + month + "/" + year + ", " + timeNsec;
                    var la = entry.entry_type.entry_type_name;
                    var bc = Number(entry.entry_type.entry_type_color).toString(16);
                    var lh = '<div style="background-color: #'+bc+'; padding-left: 1vh; padding-top: 0.5vh; padding-bottom: 0.5vh;border-radius: 15px;">'+lang["label-label"]+': '+(la ? la : lang["label-none"])+'</div>';
                    $("body").append(balanceItem({
                        comment: entry.text_note,
                        bought_by: (entry.purchased_by.person_id == me.person_id ? lang["me"] : entry.purchased_by.forename + " " + entry.purchased_by.lastname),
                        bought_by_label: lang["bought-by-label"],
                        cost: entry.amount/100 + " " + sign,
                        cost_label: lang["cost-label"],
                        payers: p,
                        labelhtml: lh,
                        lang_payers: lang["lang-payers"],
                        lang_payed: lang["lang-payed"],
                        goods: g,
                        goods_label: lang["goods-label"],
                        time: formattedDateTime,
                        time_label: lang["time-label"],
                        shop_complete: lang["shop-complete"]
                    }));
                    $("#balance-info-complete").click(function(){
                        $(this).closest(".pop").remove();
                        $(".pop").show();
                    });
                });


                $('.bal-complete').unbind("click").click(function(){
                    var entries = "";
                    for(var j = 0; j < currentShoppingList.length; j++) {
                        if(currentShoppingList[j].shopping_list_id != id)
                            continue;
                        var d = currentShoppingList[j];
                        for (var i = 0; i < d.shopping_list_entries.length; i++) {
                            if (d.shopping_list_entries[i].purchased_by_person_id)
                                continue;
                            entries += listItem({
                                entry_text: d.shopping_list_entries[i].entry_text,
                                entry_id: d.shopping_list_entries[i].shopping_list_entry_id
                            });
                        }
                        break;
                    }
                    updateShoppingList();
                });
            },
            error: console.error
        });
    });

    $(".shopping-cart").unbind("click").click(function(){
        //Add items to list
        var items = [];
        $('li.active').each(function () {
            items.push($(this));
            $(this).removeClass('active');
        });
        if(items.length == 0)
            return;
        var entries = $(items[0]).data("id");

        var list = "<li class=\"list-group-item\">" + $(items[0]).html() + "</li>";
        for(var i = 1; i < items.length; i++){
            entries += "," + $(items[i]).data("id");
            list += "<li class=\"list-group-item\">" + $(items[i]).html() + "</li>";
        }

        //Add labels to select-input
        var lb = '<option id="-2">----</option><option id="0">'+generalLabels[0]+'</option>';
        var listid = currentShoppingList.shopping_list_id;
        var labels=[];
        $.ajax({
            url: 'api/budget/entryType',
            method: 'GET',
            data: {
                shopping_list_id: listid
            },
            success: function (data) {
                labels = data.budget_entry_types;
                for(var i = 0; i < labels.length; i++){
                    lb += '<option id="' + labels[i].budget_entry_type_id + '">' + labels[i].entry_type_name + '</option>';
                }
                for(i=1; i<generalLabels.length; i++){
                    var found = false;
                    for(var j=0; j<labels.length; j++){
                        if(labels[j].entry_type_name == generalLabels[i]){
                            found = true;
                        }
                    }
                    if(!found){
                        lb += '<option id="0">'+generalLabels[i]+'</option>';
                    }
                }
                //Add buyers to list
                var b = '<option>'+lang["shop-all"]+'</option>';
                b += '<option id="choosemembers">'+lang["shop-select-members"]+'</option>';

                //Add currency to text
                var c =currentShoppingList.currency_short;


                //Opens popup
                $("body").append(popupTextList({
                    title: lang["shop-buy-title"],
                    currency: c,
                    list: list,
                    textfield: lang["shop-buy-text"],
                    textfield_com: lang["shop-register-com"],
                    textfield_label: lang["shop-register-label"],
                    label: lb,
                    byers_label: lang["shop-buyers-label"],
                    byers: b,
                    enter_member: lang["enter-member"],
                    buyers_added: lang["buyers-added"],
                    label_name: lang["label-name"],
                    new_label_color: lang["new-label-color"],
                    cancel: lang["shop-cancel"],
                    entry_ok: lang["entry-ok"],
                    data: "data-id='" + $(this).closest("div[data-id]").data("id") + "' data-entries='" + entries + "'"
                }));
                $(".addbyers").hide();
                $(".newlabel").hide();
                $(".pop .fa-times").remove();

                var currColor = "#a9d5f2";
                $(".colorpicker").spectrum({
                    color: "#a9d5f2",
                    change: function (color) {
                        currColor = color.toHexString();
                    }
                });
                /*$(".colorpicker").spectrum({
                        color: "#a9d5f2",
                        change: function (color) {
                            currColor = color.toHexString();
                        }
                    });*/

                //If label-input is changed
                $('select.label-input').change(function () {
                    console.log(generalLabels);
                    if($(this).find(":selected").text() == generalLabels[0]){
                        $(".newlabel").show();
                    }else{
                        $(".newlabel").hide();
                    }
                });
                var buyers = [];
                $("#resetmembers").unbind("click").click(function () {

                    $('.membersadded').html('');
                    buyers = [];
                });

                //If buyers-input is changed
                $('select.byers-input').change(function () {
                    if($(this).find(":selected").attr('id')=='choosemembers'){
                        $('.addbyers').show();
                        $('#scrollable-dropdown-menu2 .typeahead').typeahead({
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
                                    prefetch: {
                                        url: '/api/group/'+currentGroup.group_id+'/users',
                                        cache: false
                                    }
                                }),
                                templates: {
                                    empty: [
                                        '<div class="empty-message">',
                                        'No users found',
                                        '</div>'
                                    ].join('\n'),
                                    suggestion: Handlebars.compile('<div>{{name}} – {{email}}</div>')
                                }
                            }
                        );

                        $(".typeahead").bind('typeahead:select', function(a, data){
                            if($.inArray(data, buyers) === -1){
                                buyers.push(data);
                                $('.membersadded').append(data.name);
                            }
                        });




                        $(".typeahead").bind('typeahead:close', function(){
                            $(".typeahead").val("");
                        });
                    }else{
                        $(".addbyers").hide();
                    }
                });

                $('#t-popup-complete').unbind("click").click(function () {
                    var entries = $('.pop').find('[data-entries]').data("entries");
                    var shopid = currentShoppingList.shopping_list_id;
                    var price = Number($('#shop-entry-cost').val()) * 100;
                    if(isNaN(price)) return;
                    var comment = $('#shop-entry-name').val();
                    if(comment==""){
                        for(var k=0; k<items.length; k++){
                            comment += items[k].html() + ", ";
                        }
                    }
                    var budgetentrytypeid = 0;
                    var labelvalue = $('select.label-input').find(":selected").attr('id');
                    if(labelvalue==-2){ //without labels
                        console.log('no label');
                        budgetentrytypeid = null;
                    }else if(labelvalue==0){ //general labels
                        console.log("general label");
                        var name;
                        var colorInt;
                        if($('.newlabel').is(":visible")){
                            name = $('#new-label-name').val();
                            colorInt = Number(parseInt(currColor.split("#")[1],16));
                        }else{
                            name = $('select.label-input').val();
                            var color = '#a9d5f2';
                            colorInt = Number(parseInt(color.split("#")[1],16));
                        }
                        $.ajax({
                            url: '/api/budget/entryType',
                            method: 'POST',
                            data: {
                                entry_type_name: name,
                                entry_type_color: colorInt,
                                shopping_list_id: shopid
                            },success:function (data) {
                                budgetentrytypeid = data;
                                var personsids = [];
                                for(var k=0; k<buyers.length; k++){
                                    personsids.push(buyers[k].person_id);
                                }

                                var slei = entries;

                                var inputdata = {};
                                if(budgetentrytypeid==null){
                                    inputdata = {
                                        shopping_list_id: shopid,
                                        amount: price,
                                        text_note: comment,
                                        person_ids: personsids.join(','),
                                        shopping_list_entry_ids: slei
                                    }
                                }else{
                                    inputdata = {
                                        shopping_list_id: shopid,
                                        amount: price,
                                        text_note: comment,
                                        person_ids: personsids.join(','),
                                        shopping_list_entry_ids: slei,
                                        budget_entry_type_id: budgetentrytypeid
                                    }
                                }
                                console.log(inputdata);
                                $.ajax({
                                    url: '/api/budget',
                                    method: 'POST',
                                    data: inputdata,
                                    success: function (data) {
                                        console.log(data);
                                        $('.pop').remove();
                                    },
                                    error: console.error
                                });
                            },error:console.error
                        });
                    }else { //labels in the DB
                        console.log("premade label");
                        budgetentrytypeid = labelvalue;
                        var personsids = [];
                        for(var k=0; k<buyers.length; k++){
                            personsids.push(buyers[k].person_id);
                        }

                        var slei = entries;

                        var inputdata = {};
                        if(budgetentrytypeid==null){
                            inputdata = {
                                shopping_list_id: shopid,
                                amount: price,
                                text_note: comment,
                                person_ids: personsids.join(','),
                                shopping_list_entry_ids: slei
                            }
                        }else{
                            inputdata = {
                                shopping_list_id: shopid,
                                amount: price,
                                text_note: comment,
                                person_ids: personsids.join(','),
                                shopping_list_entry_ids: slei,
                                budget_entry_type_id: budgetentrytypeid
                            }
                        }
                        console.log(inputdata);
                        $.ajax({
                            url: '/api/budget',
                            method: 'POST',
                            data: inputdata,
                            success: function (data) {
                                console.log(data);
                                $('.pop').remove();
                            },
                            error: console.error
                        });
                    }
                });
                $('#t-popup-cancel').unbind("click").click(function () {
                    $('.pop').remove();
                });
            },
            error: console.error
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
            if($(this).hasClass("active")){
                $(this).removeClass("active");
            }else{
                $(this).addClass("active");
            }
            //$(this).find("input[type=checkbox]").prop('checked', $(this).find("input:checked").length == 0);
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

    $('#group-post2').click(function() {
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
            generalLabels = [data["shop-new-label"], data["label-party"], data["label-food"], data["label-clean"], data["label-repairs"]];

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
                        generalLabels = [data["shop-new-label"], data["label-party"], data["label-food"], data["label-clean"], data["label-repairs"]];

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
                        generalLabels = [data["shop-new-label"], data["label-party"], data["label-food"], data["label-clean"], data["label-repairs"]];
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


function deletegroup() {
    $.ajax({
        url: '/api/group'
    })
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
			if (result.budget.length < 0) {
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
			for (var i = 0; i < result.budget.length; i++) {
				var element = result.budget[i];
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
			if (error == "Bad Request" && jqXHR.responseText == "No data found.") {
				$('#stat0').remove();
				
			}
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
			var colourPart = parseInt(colour.toString(16).slice(i, i + 2), 16);
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

    $('#done-tasks-btn').unbind('click').click(function(){
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

    $('.fa-user').unbind('click').click(function(){
        addMembersPopup($(this).closest('li[data-id]').data('id'));
    });
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
                window.location="/login.html";
            }
        }
    });
});



function getCalendar() {
    var recipeNameChosenGroup = "";
    var recipeTimeChosenGroup = "";
    $.ajax({
        url: '/api/recipe/' + currentGroup.group_id,
        method: 'GET',
        success: function (datatFOod) {
            var events = [];
            for (var i = 0; i < datatFOod.length; i++) {
                recipeNameChosenGroup = datatFOod[i].recipe_name;
                recipeTimeChosenGroup = datatFOod[i].meal_datetime.split("T")[0];
                events.push({
                    title: recipeNameChosenGroup,
                    start: recipeTimeChosenGroup,
                    recipe_id: datatFOod[i].recipe_id
                });
            }
            /**
             * This method creates the standard calender.
             */
            $('#oda #calendar').fullCalendar({
                height: 530,
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,agendaWeek,agendaDay,listWeek'
                },
                eventColor: '#7ebccc',
                defaultDate: '2018-01-01',
                navLinks: true, // can click day/week names to navigate views
                eventLimit: true, // allow "more" link when too many events
                events: events,
                cache: false
            });
        },
        error: console.error()
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
	$('#stat0').remove();
}

function showFirstStat() {
	$('#stat_container').append('<canvas id="stat0" class="chart"></canvas>');
	$("#stat0").css('display', 'block');
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

function addMembersPopup(todo){
    var thememberstring;
    var themember;

    for(var i=0; i<dataTask.length; i++){
        if(dataTask[i].todo_id==todo){
            if(!dataTask[i].assigned_to && !dataTask[i].assigned_to.forename) thememberstring = null;
            else{
                thememberstring = dataTask[i].assigned_to.forename + " " + dataTask[i].assigned_to.lastname;
            }
        }
    }

    $('body').append(popupAssign({
        assign_header: lang["assign-header"],
        assign_name: lang["assign-name"],
        assign_ok: lang["assign-ok"],
        assign_cancel: lang["assign-cancel"],
        member_task: ((thememberstring) ? "" : thememberstring)
    }));
    //Shows suggestions when characters is typed
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
                prefetch: {
                    url: '/api/group/'+currentGroup.group_id+'/users',
                    cache: false
                }
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
        var personid = themember.person_id;
        var personids = [];
        personids.push(personid);
        console.log(personids);
        console.log("---");
        console.log(themember);
        $.ajax({
            url: '/api/tasks/person/'+todo,
            method: 'POST',
            data: {
                people: personids.join(",")
            },
            success: function () {
                console.log("Todo updated");
                for (var i = 0; i < dataTask.length;i++) {
                    if (dataTask[i].todo_id == todo) {
                        dataTask[i].assigned_to.forename = themember.name;
                        dataTask[i].assigned_to.middlename = "";
                        dataTask[i].assigned_to.lastname = " ";
                    }
                }
                showCurTasks();
                $('.pop').remove();
            },
            error: console.error
        })
    });
    $('.assigncancel').unbind("click").click(function () {
        $('.pop').remove();
    });
}


/**
 * THE ADMIN PAGE
 */


/**
 * Gets all users in the database
 */
var allUsers = [];

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


$('document').ready(function() {
    /**
     * This method retrvies information about a user: person_id,forname and lastname
     */
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
        success: function (data) {
            me = data[0];
        }
    });
});

function updateShoppingList(){
    var data = currentShoppingList;
    $('#shopping').children().html(groupShopping());
    updateLang();
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