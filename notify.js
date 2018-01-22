
// This will be what checks for new notifications to be sent out.
window.setInterval(function() {
	pool.getConnection(function(err, connection) {
		if (err)) {throw err;}
		
		var newNotifications = null;
		connection.query(
			"(SELECT person_id, todo_id, todo_text, datetime_deadline, color_hex, null AS private_list_id FROM " +
			"todo LEFT JOIN todo_person USING(todo_id) WHERE " +
			"datetime_deadline BETWEEN DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 23 HOUR) AND " +
			"DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL '24:1' HOUR_MINUTE) " +
			"AND person_id IS NOT NULL AND datetime_done IS NULL ORDER BY datetime_deadline ASC) " +
			"UNION " +
			"(SELECT person_id, private_todo_entry_id, todo_text, datetime_deadline, color_hex, private_todo_list_id FROM " +
			"private_todo_list LEFT JOIN private_todo_entry USING(private_todo_list_id) WHERE " +
			"datetime_deadline BETWEEN DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 23 HOUR) AND " +
			"DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL '24:1' HOUR_MINUTE) AND " +
			"datetime_done IS NULL ORDER BY datetime_deadline ASC);",
			[], function(err, result) {
				connection.release();
				(err) ? newNotifications = null : newNotifications = result;
			}
		);
		
		// Filter what is new and what is already seen, and add the new ones to the right users.
		if (newNotifications) {
			
		}
	});
}, 3600000);
