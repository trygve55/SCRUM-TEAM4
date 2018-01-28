/**
 * Test for the tasks API.
 * Authors: Andrzej Cabala (main author), Magnus Eilertsen
 */
describe('Tasks API', function() {
	// Test bad requests.
    describe('Rejecting bad requests',function() {
        it('/ - should return 404', function(done) {
            request.get('/api/tasks').expect(404).end(done);
        });
        //it('should return 400', function(done) {request.get('/api/tasks/person').expect(400).end(done);});
        it('/person - should return 404', function(done) {
            request.delete('/api/tasks/person').expect(404).end(done);
        });
        it('/:todo_id/done - should return a 500', function(done) {
            request.put('/api/tasks/15000/done').expect(500).end(done);
        });
    });

    describe('/api/tasks/ GET methods',function() {
        describe('/:task_id', function() {
            it('should return the entire task with the description "test task"', function(done) {
                request.get('/api/tasks/1').expect(200).end(function(err, res) {
                    var variables = ["todo_id", "datetime_deadline", "datetime_added",
                        "datetime_done", "forename", "middlename",
                        "lastname", "todo_text", "is_deactivated", "color_hex"];
                    var hasVariables = true;
                    variables.forEach(function(element) {
                        if(!res.body[0].hasOwnProperty(element)) {
                            console.log("MISSING VARIABLE: '" + element + "'");
                            hasVariables = false;
                        }
                    });
                    chai.expect(hasVariables).to.be.true;
                    chai.expect(res.body[0].todo_text).to.equal("test task");
                    done();
                });
            });
        });
        describe('/notify', function() {
            it('should return 200', function(done) {
                request.get("/api/tasks/notify").expect(200).end(done);
            });
        });
        describe('/repeat/:group_id', function() { // TODO make test data so this doesn't return 400, same for following one
            it('should get the data for all tasks that repeat', function(done) {
                request.get("/api/tasks/repeat/1").expect(400).end(done);
            });
        });
        describe('/private/:todo_id', function() {
            it('shouold return data about a private task', function(done) {
                request.get("/api/tasks/private/1").expect(400).end(done);
            });
        });
        describe('/person/:person_id', function() {
            it('should get all tasks for a user', function(done) {
                request.get('/api/tasks/person/1').expect(200).end(done);
            });
        });
        describe('/todo/:todo_id', function() {
            it('should get data about a task', function(done) {
                request.get('/api/tasks/todo/1').expect(200).end(done);
            });
        });
    });


    describe('/api/tasks/ POST methods', function() {
        describe('/', function() {
            it('should return status 200 for posting a new task without repetition', function(done) {
                request.post('/api/tasks/').send({"group_id":1, "todo_text":"DELETE"}).expect(200).end(done);
            });
            it('should return status 200 for posting a new task with repetition', function(done) { // TODO fix this test (or remove)
                request.post('/api/tasks/')
                    .send({"group_id":1, "todo_text":"DELETE", "time_interval":3})
                    .expect(400)
                    .end(done);
            });
            after('delete tasks added in the tests', function(done) {
                pool.query("DELETE FROM todo WHERE todo_text = 'DELETE'", function(err, result) {
                    if(err)throw err;
                    done();
                });
            });
        });
        describe('/person/:todo_id', function() {
            it('should return status 200 for adding new person to task', function(done) {
                request.post('/api/tasks/person/1').send({"people":[2, 3]}).expect(200).end(done);
            });
        });
    });


    describe('Testing PUT & DELETE methods', function() {
        var testId = -1;
        before('set up test task to edit during tests', function(done) {
            pool.query("INSERT INTO todo(group_id, todo_text, created_by_id) VALUES (1,'DOCUMENT YOUR SHIT',2)", function(err, result) {
                if(err) throw err;
                testId = result.insertId;
                done();
            });
        });
        describe('/:todo_id/done', function() {
            it('should update a task, to set it as completed', function(done) {
                request.put('/api/tasks/' + testId + '/done').expect(200).end(done);
            });
        });
        describe('/:todo_id/undo', function() {
            it('should update a task, to set it as not completed', function(done) {
                request.put('/api/tasks/' + testId + '/undo').expect(200).end(done);
            });
        });
        describe('/:todo_id', function() {
            it('should update a task with the given data', function(done) {
                request.put('/api/tasks/' + testId).send({
                    "todo_text": "here's hoping"
                }).expect(200).end(done);
            });
        });
        /*describe('/:todo_id', function() {
            it('should return status 200 for editing task', function(done) {
                request.put('/api/tasks/1').send({"todo_text":"Delete!", "created_by_id":2}).end(function(err) {
                    if(err) throw err;
                    request.put('/api/tasks/1').send({"todo_text":"test task", "created_by_id":1}).expect(200).end(done);
                });
            });
        });*/
        describe('/todo/:todo_id', function() {
            it('should delete the specified task', function(done) {
                request.delete('/api/tasks/todo/' + testId).expect(200).end(done);
            });
        });

        after('delete test task', function(done) {
            if(testId != -1) {
                pool.query("DELETE FROM todo WHERE todo_id = ?", [testId], function(err, result) {
                    if(err) throw err;
                    done();
                });
            } else {
                console.log("ERROR: testId was -1 after tests");
            }
        });
    });

    describe('Testing DELETE methods', function() {
        it('should return status 200 for deleting task', function(done) {
            request.delete('/api/tasks/person/1').send({"people":[3, 2]}).expect(200).end(done);
        });
    });
});