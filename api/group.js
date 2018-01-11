var router = require('express').Router();

router.post('/', function(req, res){
    if(!req.body.group_name)
        return res.status(400).send("Bad Request");
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send(JSON.stringify(err));
        var group = req.body;
        var qry = "SELECT group_id FROM home_group WHERE group_name = ?";
        connection.query(qry, [group.group_name], function(err, result){
            if(err) {
                connection.release();
                return res.status(500).send(err.code);
            }
            if(result.length > 0) {
                connection.release();
                return res.status(400).send("Group already exists");
            }
            qry = "INSERT INTO home_group (shopping_list_id";
            var values = [1];
            for(var p in group){
                if(group.hasOwnProperty(p)){
                    if(values.length != 0)
                        qry += ", ";
                    qry += p;
                    values.push(group[p]);
                }
            }
            if(values.length == 0) {
                connection.release();
                return res.status(500).send("No values found");
            }
            qry += ") VALUES (?";
            console.log(values);
            for(var i = 0; i < values.length-1; i++){
                qry += ", ?";
            }
            qry += ");";
            console.log(qry);
            connection.query(qry, values, function(err, result){
                connection.release();
                if(err) {
                    return res.status(400).send(err.code + "\n" + err.sqlMessage);
                }
                else
                    return res.json(result);
            });
        });
    });
});

router.get('/', function(req, res){
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send("Error");
        var qry = "";
        if(!req.query.group_name && !req.query.group_id)
            qry = "SELECT * FROM home_group;";
        else
            qry = "SELECT * FROM home_group WHERE " + (req.query.group_name ? "group_name" : "group_id") + " = ?;";
        console.log(qry);
        connection.query(qry, [req.query.group_name || req.query.group_id], function(err, result){
            if(err){
                connection.release();
                return res.status(400).send(err.code + "\n" + err.sqlMessage);
            }
            res.json(result);
        });
    });
});

router.put('/', function(req, res){
    if(!req.body.group_id)
        return res.status(400).send("Bad Request");
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send("Error");
        var qry = "UPDATE home_group SET ";
        var f = true;
        var vals = [];
        for(var p in req.body){
            if(req.body.hasOwnProperty(p)){
                if(p == "group_id")
                    continue;
                if(!f)
                    qry += ", ";
                qry += p + " = ?";
                f = false;
                vals.push(req.body[p]);
            }
        }
        vals.push(req.body.group_id);
        qry += " WHERE group_name = ?";
        connection.query(qry, vals, function(err, result){
            connection.release();
            if(err)
                return res.status(400).send(err.code + "\n" + err.sqlMessage);
            return res.json(result);
        });
    });
});

router.post('/user', function(req, res){
    if(!req.body.members || !req.body.group)
        return res.status(400).send("Bad Request");
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send("Internal Error");
        var qry = "";
        var vals = [];
        for(var i = 0; i < req.body.members.length; i++){
            qry += "INSERT INTO group_person (person_id, group_id) VALUES (?, ?);";
            vals.push([req.body.members[i], req.body.group_id]);
        }
        connection.query(qry, vals, function(err, result){
            connection.release();
            if(err)
                return res.status(500).send(err.code);
            res.json(result);
        });
    });
});

router.delete('/user', function(req, res){
    if(!req.body.person_id || !req.body.group_id || !req.body.role_id)
        return res.status(400).send("");
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send("Internal Error");
        connection.query("DELETE FROM group_person WHERE group_id = 1 AND person_id = 1", [req.body.group_id, req.body.person_id], function(err, result){

        });
    });
});

router.put('/userPrivileges', function(req, res){
    if(!req.body.person_id || !req.body.group_id || !req.body.role_id)
        return res.status(400).send("");
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send("Internal Error");
        connection.query("SELECT COUNT(*) FROM home_group WHERE group_id = ?", [req.body.group_id], function(err, result){
            if(err || result[0]["COUNT(*)"] == 0) {
                console.error(err || result);
                connection.release();
                return res.status(400).send("");
            }
            connection.query("SELECT COUNT(*) FROM person WHERE person_id = ?", [req.body.person_id], function(err, result){
                if(err || result[0]["COUNT(*)"] == 0) {
                    console.error(err || result);
                    connection.release();
                    return res.status(400).send("");
                }
                connection.query("UPDATE group_person SET role_id = ? WHERE group_id = ? AND person_ID = ?", [req.body.role_id, req.body.group_id, req.body.person_id], function(err, result){
                    connection.release();
                    if(err)
                        return res.status(400).send("");
                    res.json(result);
                })
            });
        });
    });
});

module.exports = router;