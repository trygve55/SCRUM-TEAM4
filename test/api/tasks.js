/**
 * Test for the tasks API.
 */
describe('Tasks API', function() {
	// Test bad requests.
	it('should return 404', function(done) {request.get('/api/tasks').expect(404).end(done);});
	it('should return 400', function(done) {request.get('/api/tasks/person').expect(400).end(done);});
	it('should return 404', function(done) {request.delete('/api/tasks/person').expect(404).end(done);});

	// GET
	it('should return the entire task with the description "test task"', function(done) {
		var expected = {
			"todo_id": 1,
			"group_id": 1,
			"todo_text": "test task",
			"datetime_deadline": null,
			"datetime_added": "2018-01-16T09:41:39.000Z",
			"datetime_done": null,
			"created_by_id": 1,
			"done_by_id": null,
			"is_deactivated": false,
			"people": [{"person_id": 1}]
		};
		var req = request.get('/api/tasks/1').expect(200).expect(expected).end(done);
	});

	// GET
	it('should return a task for person with id 1', function(done) {
		var expected = [{
			"todo_id": 1,
			"group_id": 1,
			"todo_text": "test task",
			"datetime_deadline": null,
			"datetime_added": "2018-01-16T09:41:39.000Z",
			"datetime_done": null,
			"created_by_id": 1,
			"done_by_id": null,
			"is_deactivated": false
		}];
		var req = request.get('/api/tasks/person/1').expect(200).expect(expected).end(done);
	});

	// POST
	it('should return status 200 for posting a new task', function(done) {
		request.post('/api/tasks/').send({"group_id":1, "todo_text":"New", "created_by_id":1}).expect(200).end(done);
	});

	// PUT
	it('should return status 200 for editing task', function(done) {
		request.put('/api/tasks/1').send({"todo_text":"Delete!", "created_by_id":2}).end(function(err) {
			if(err) {return done(err);}
			request.put('/api/tasks/1').send({"todo_text":"test task", "created_by_id":1}).expect(200).end(done);
		});
	});

	// POST
	it('should return status 200 for adding new person to task', function(done) {
		request.post('/api/tasks/person/').send({"todo_id":1, "person_id":2}).expect(200).end(done);
	});

	// DELETE
	it('should return status 200 for deleting task', function(done) {
		request.delete('/api/tasks/person/2').send({"todo_id":1}).expect(200).end(done);
	});
});