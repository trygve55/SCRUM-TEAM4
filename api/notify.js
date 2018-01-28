/**
 * @module Notification center API
 */
var router = require('express').Router();

/**
 * @name Gets all invitations and notifications on tasks
 * @route {GET} /api/notify
 */
router.get('/', function(req, res){
    var ret = [];
    pool.query('SELECT group_name, group_id FROM group_person ' +
        'LEFT JOIN home_group USING (group_id) ' +
        'WHERE person_id = ? AND invite_accepted = 0 AND was_invited = 1', [req.session.person_id], function(err, result){
        if(err)
            return res.status(500).send(err);
        ret = ret.concat(result);
        pool.query(
        "(SELECT person_id, todo_text, todo_id FROM todo_person " +
        "LEFT JOIN todo USING(todo_id) " +
        "WHERE datetime_deadline < DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL '24:1' HOUR_MINUTE) " +
        "AND person_id IS NOT NULL AND datetime_done IS NULL AND person_id = ? ORDER BY datetime_deadline ASC) " +
        "UNION " +
        "(SELECT person_id, todo_text, private_todo_entry_id AS todo_id FROM private_todo_entry " +
        "LEFT JOIN private_todo_list USING(private_todo_list_id) " +
        "WHERE datetime_deadline < DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL '24:1' HOUR_MINUTE) " +
        "AND datetime_done IS NULL AND person_id = ? ORDER BY datetime_deadline ASC);",
            [req.session.person_id, req.session.person_id], function(err, result) {
                if (err)
                    return res.status(500).send(err);
                ret = ret.concat(result);
                pool.query('SELECT shopping_list_id, shopping_list_name FROM shopping_list_person LEFT JOIN shopping_list USING (shopping_list_id) WHERE person_id = ? AND is_hidden = 0 AND invite_accepted = 0',
                    [req.session.person_id], function(err, result){
                        if (err)
                            return res.status(500).send(err);
                        ret.push(result);
                        res.status(200).send(ret);
                    });
            });
    });
});

module.exports = router;