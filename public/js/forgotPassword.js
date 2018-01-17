
function reset() {
	var adress = $("#adrinput");
	var exists;
	$.ajax({
		type:"GET",
		url:"data/quizlist/" + adress,
		contentType:"application/json",
		dataType:"json",
		success:function(result) {exists = (result.message === 'E-mail already exists');}
	});	// Check if adress exists
	if (exists) {
		
	}
}