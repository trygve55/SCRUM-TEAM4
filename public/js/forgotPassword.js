
function reset() {
	var adress = $("#adrinput"), exists;
	$.ajax({type:"GET", url:"api/mail/" + adress.val(), contentType:"application/json", dataType:"json",
		success:function(result) {exists = (result.message === 'E-mail already exists');}
	});	// Change to POST with all the tokens and stuffs.
	
	if (exists) {
		// 1. Get a temp password.
		
		// 2. Send EMAIL with link.
		
	}
	else {
		adress.val("");
		adress.attr("placeholder", "Email doesn't exist.");
	}
}