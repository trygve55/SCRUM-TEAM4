var router = require('express').Router();

module.exports = router;

/**
 * Registers a new
 *
 * URL: /api/tasks/private/
 * method: POST
 *
 */

router.post('/', function (req, res) {
    var p_id = req.session.person_id;

    if(p_id == null)
        return res.status(403).send("Invalid request, you must log in");

    pool.query('INSERT INTO private_todo_list (person_id) VALUES(?)', [p_id], function(err, result) {
        if (err)
            return res.status(400).json({error: "SQL-query failing"});
        return res.status(200).json({success: true});
    });
});

router.post('/entry', function (req, res) {
    var p_id = req.session.person_id, data = req.body;

    if (!data.private_todo_list_id || !data.todo_text)
        return res.status(400).send("body error");

    if(p_id == null)
        return res.status(403).send("Invalid request, you must log in");

    pool.query('INSERT INTO private_todo_entry (private_todo_list_id, todo_text) VALUES(?,?)',
        [data.private_todo_list_id, data.todo_text], function (err, result) {
            if(err)
                return res.status(400).json({error: err});
            return res.status(200).json({success:"added entry", private_todo_list_id:result.insertId})
    });
});


//unfinished
/*
router.get('/', function(req, res) {
    var p_id = req.session.person_id;

    if (p_id == null)
        return res.status(403).send('Invalid request, you must login');

    pool.query('SELECT * FROM private_todo_list ' +
        'LEFT JOIN private_todo_entry ' +
        'USING(private_todo_list_id) ' +
        'WHERE person_id = ?;',[p_id], function (err, result) {
        if(err)
            return res.status(400).json({error: "sql-fail"});
        if(!result.length)
            return res.status(400).json({error: "the data requested does not exist"});

        var private_todo_lists = [];

        for (var i = 0; i < result.length; i++) {
            var current_private_todo_list = existsInArray(result[i].private_todo_list_id, private_todo_entries);
            if (current_private_todo_list === -1) {
                private_todo_lists.push({
                    "private_todo_list_id":result[i].private_todo_list_id,
                    "private_todo_list_name":result[i].private_todo_list_name,
                    "is_deactivated":result[i].is_deactivated,
                    "color_hex":result[i].color_hex,
                    private_todo_entries:[]
                });
                current_private_todo_list = private_todo_lists.length - 1;
                if(result[i].private_todo_entry_id) private_todo_lists[current_private_todo_list].private_todo_entries.push({
                    "private_todo_entry_id":result[i].private_todo_entry_id,
                    "todo_text":result[i].todo_text,
                    "datetime_deadline":result[i].datetime_deadline,
                    "datetime_added":result[i].datetime_added,
                    "datetime_done":result[i].datetime_done
                });

            }


        }

        for (i = 0; i < private_todo_lists.length; i++) {
            private_todo_lists[i].priva = removeDuplicates(shopping_lists[i].shopping_list_entries);
        }







        return res.status(200).json(private_todo_lists);
    });
});

*/


/**
 * Make sure the array only contains unique elements.
 */
function removeDuplicates(arr) {
    var added_ids = [], unique_array = arr.filter(function(elem, index, self) {
        if (elem.person_id) {
            if (added_ids.indexOf(elem.person_id) == -1) {
                added_ids.push(elem.person_id);
                return true;
            } else { return false; }
        } else if (!elem.shopping_list_entry_id && elem.shopping_list_id) {
            if (added_ids.indexOf(elem.shopping_list_id) == -1) {
                added_ids.push(elem.shopping_list_id);
                return true;
            } else { return false; }
        } else if (elem.shopping_list_entry_id) {
            if (added_ids.indexOf(elem.shopping_list_entry_id) == -1) {
                added_ids.push(elem.shopping_list_entry_id);
                return true;
            } else { return false; }
        }
        return index == self.indexOf(elem);
    });
    return unique_array;
}


/**
 * Find the index of this in this JSON array, if it exists. -1 otherwise.
 */
function existsInArray(shopping_list_id, array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].shopping_list_id == shopping_list_id) return i;
    }
    return -1;
}