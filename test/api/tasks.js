/**
 * Test for the tasks API.
 */
describe('Tasks API', function() {
	var Cookies;

	/**
	 * Test bad requests.
	 */
	it('should return 404', function(done) {request.get('/api/tasks').expect(404).end(done);});
	it('should return 404', function(done) {request.delete('/api/tasks/person').expect(404).end(done);});

	/**
	 * Test the GET requests.
	 */
	it('should return the entire task with the description "test task"', function(done) {
		var expected = {
			"todo_id": 1,
			"group_id": 1,
			"todo_text": "test task",
			"datetime_deadline": null,
			"datetime_added": "2018-01-15T14:09:42.000Z",
			"datetime_done": null,
			"created_by_id": 1,
			"done_by_id": null,
			"is_deactivated": false,
			"people": [{"person_id": 1}]
		};
		var req = request.get('/api/tasks').query({todo_id: '1'});
		req.cookies = Cookies;
		req.expect(200).expect(expected).end(done);
	});
	it('should return a task for person with id 1', function(done) {
		var expected = [{
			"todo_id": 1,
			"group_id": 1,
			"todo_text": "test task",
			"datetime_deadline": null,
			"datetime_added": "2018-01-15T14:09:42.000Z",
			"datetime_done": null,
			"created_by_id": 1,
			"done_by_id": null,
			"is_deactivated": false
		}];
		var req = request.get('/api/tasks/person').query({person_id: '1'});
		req.cookies = Cookies;
		req.expect(200).expect(expected).end(done);
	});
});