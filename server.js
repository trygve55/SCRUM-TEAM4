var http = require('http').createServer(require('./main')).listen(8000);
var oxr = require('open-exchange-rates');
var money = require('money');

socket = require('./sockets')(http);

oxr.set({ app_id: '17204eb2a6a445a493d5fd136b1058ac' });

convert = function(amount, from, to, cb, po){
    console.log(isEmpty(money.rates));
    console.log(isEmpty(money.rates));
    if(!isEmpty(money.rates))
        return cb(money.convert(amount, {from: from, to: to}), po);
    oxr.latest(function() {
        money.rates = oxr.rates;
        money.base = oxr.base;
        cb(money.convert(amount, {from: from, to: to}), po);
    });
};

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

console.log("Server is listening on port 8000...");