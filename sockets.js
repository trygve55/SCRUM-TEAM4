var socks = [];

module.exports = function(http){
    var io = require('socket.io')(http);

    io.on('connection', function(scket){
        console.log('connected');
        scket.on('setup', function(data){
            for(var i = 0; i < socks.length; i++){
                if(socks[i].socket.id == scket.id)
                    return;
                else if(socks[i].person_id == data.person_id && socks[i].socket.id == scket.id) {
                    console.log("reset");
                    return (socks[i].socket = scket);
                }
            }
            pool.query('SELECT group_id FROM group_person WHERE person_id = ?', [data.person_id], function(err, result){
                if(err){
                    console.error(err);
                    return scket.emit('error', err);
                }
                pool.query('SELECT shopping_list_id FROM shopping_list_person WHERE person_id = ?', [data.person_id], function(err, result2){
                    if(err){
                        console.error(err);
                        return scket.emit('error', err);
                    }
                    socks.push({
                        socket: scket,
                        person_id: data.person_id,
                        groups: result,
                        shopping_lists: result2
                    });
                });
            });
        });

        scket.on('update', function(data){
            for(var i = 0; i < socks.length; i++){
                if(socks[i].socket.id == scket.id){
                    if(data.group_id && data.del){
                        for(var j = 0; j < socks[i].groups.length; j++){
                            if(socks[i].groups[j] == data.group_id) {
                                socks[i].groups.splice(j, 1);
                                break;
                            }
                        }
                    }
                    else if(data.group_id){
                        socks[i].groups.push(data.group_id);
                    }
                    if(data.shopping_list_id && data.del){
                        for(var j = 0; j < socks[i].shopping_lists.length; j++){
                            if(socks[i].shopping_lists[j] == data.shopping_list_id) {
                                socks[i].shopping_lists.splice(j, 1);
                                break;
                            }
                        }
                    }
                    else if(data.shopping_list_id)
                        socks[i].groups.push(data.shopping_list_id);
                }
            }
        });

        scket.on('disconnect', function(){
            console.log('disconnected');
            for(var i = 0; i < socks.length; i++){
                if(socks[i].socket.id == scket.id) {
                    console.log("done");
                    socks.splice(i, 1);
                    break;
                }
            }
        });
    });

    return {
        group_data: function(channel, group_id, data){
            for(var i = 0; i < socks.length; i++){
                if(socks[i].groups.indexOf(group_id) > -1)
                    socks[i].socket.emit(channel, data);
            }
        },
        person_data: function(channel, person_id, data){
            for(var i = 0; i < socks.length; i++){
                if(socks[i].person_id == person_id)
                    socks[i].socket.emit(channel, data);
            }
        },
        shopping_list_data: function(channel, shopping_list_id, data){
            for(var i = 0; i < socks.length; i++){
                if(socks[i].shopping_lists.indexOf(shopping_list_id) > -1)
                    socks[i].socket.emit(channel, data);
            }
        }
    };
};