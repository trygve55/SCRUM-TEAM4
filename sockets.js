var socks = [];

module.exports = function(http){
    var io = require('socket.io')(http);

    io.on('connection', function(scket){
        console.log('connected');
        scket.on('setup', function(data){
            for(var i = 0; i < socks.length; i++){
                if(socks[i].socket.id == scket.id)
                    return;
            }
            socks.push({
                socket: scket.id,
                person_id: data.person_id,
                groups: data.groups
            });
        });

        scket.on('disconnect', function(){
            console.log('disconnected');
            for(var i = 0; i < socks.length; i++){
                if(socks[i].socket.id == scket.id) {
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