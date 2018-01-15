/**
 * Prepare server for tests.
 */
before(function(done) {
	request.get('/api/tasks/person/1')
		.expect(200)
		.end(function(err, res) {
			if (err) {return done(err);}
			Cookies = res.headers['set-cookie'].pop().split(';')[0];
			console.log(Cookies);
			return done();
		}
	);
});

after(function() {pool.end();});

/**
 * Test for the tasks API.
 */
describe('Tasks API', function() {
	var Cookies;

	/**
	 * Test bad requests.
	 */
	it('should return 400', function(done) {request.get('/api/tasks').expect(400).end(done);});
	it('should return 400', function(done) {request.get('/api/tasks/person').expect(400).end(done);});
	it('should return 400', function(done) {request.delete('/api/tasks/person').expect(400).end(done);});

	/**
	 * Test the GET requests.
	 */
	it('should return the entire task with the description "Tiberium Harvesting"', function(done) {
		var expected = {
				"todo_id": 1,
				"group_id": 1,
				"todo_text": "Tiberium Harvesting",
				"datetime_deadline": "9999-12-30T23:00:00.000Z",
				"datetime_added": "2018-01-15T09:31:26.000Z",
				"datetime_done": null,
				"created_by_id": 1,
				"done_by_id": null,
				"is_deactivated": false,
				"people": [{"person_id": 1}]
			};
		var req = request.get('/person/1').query({path: '/test.html'});
		req.cookies = Cookies;
		req.expect(200).expect(expected).end(done);
	);
	
	it('should return a task for person with id 1', function(done) {
		var req = request.get('/api/tasks').query({path: '/test.html'});
		req.cookies = Cookies;
		req.expect(200).expect({todo_text: "Tiberium Harvesting"}).end(done);
	});

	
	
});