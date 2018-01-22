/**
 * Test for the tasks API.
 * Authors: Andrzej Cabala (main author), Magnus Eilertsen
 */
describe('Tasks API', function() {
	// Test bad requests.
    describe('Rejecting bad requests',function() {
        it('should return 404', function(done) {request.get('/api/tasks').expect(404).end(done);});
        it('should return 400', function(done) {request.get('/api/tasks/person').expect(400).end(done);});
        it('should return 404', function(done) {request.delete('/api/tasks/person').expect(404).end(done);});
    });

    describe('Testing GET methods',function() {
        it('should return the entire task with the description "test task"', function(done) {
            request.get('/api/tasks/1').expect(200).end(function(err, res) {
                var variables = ["todo_id", "group_id", "todo_text", "datetime_deadline",
                    "datetime_added", "datetime_done", "created_by_id",
                    "done_by_id", "is_deactivated", "color_hex", "people"];
                var hasVariables = true;
                variables.forEach(function(element) {
                    if(!res.body.hasOwnProperty(element)) {
                        console.log("MISSING VARIABLE: '" + element + "'");
                        hasVariables = false;
                    }
                });
                chai.expect(hasVariables).to.be.true;
                chai.expect(res.body.todo_text).to.equal("test task");
                done();
            });
        });
        /*it('should return a task for person with id 1', function(done) {
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
            request.get('/api/tasks/person/1')
                .expect(200)
                //.expect(expected)
                .end(function(err, res) {
                    chai.expect(res.body.todo_text).to.equal("test task");
                    done();
                });
        });*/
    });

    describe('Testing POST methods', function() {
        it('should return status 200 for posting a new task', function(done) {
            request.post('/api/tasks/').send({"group_id":1, "todo_text":"New", "created_by_id":1}).expect(200).end(done);
        });
        it('should return status 200 for adding new person to task', function(done) {
            request.post('/api/tasks/person/1').send({"people":[2, 3]}).expect(200).end(done);
        });
    });

    describe('Testing PUT methods', function() {
        it('should return status 200 for editing task', function(done) {
            request.put('/api/tasks/1').send({"todo_text":"Delete!", "created_by_id":2}).end(function(err) {
                if(err) throw err;
                request.put('/api/tasks/1').send({"todo_text":"test task", "created_by_id":1}).expect(200).end(done);
            });
        });
    });

    describe('Testing DELETE methods', function() {
        it('should return status 200 for deleting task', function(done) {
            request.delete('/api/tasks/person/1').send({"people":[3, 2]}).expect(200).end(done);
        });
    });
});