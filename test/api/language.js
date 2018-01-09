'use strict';

var lang = require('../../api/language');

describe('#language.js', function(){
    it('should return username', function(){
        request.get('/api/language').send({
            path: '/login.html',
            lang: 'en_US'
        }).expect(200).end(function(err, res){
            console.log(res);
            chai.expect(res).to.equal("Username");
            done(err);
        });
    });
});