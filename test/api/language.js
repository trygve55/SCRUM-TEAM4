'use strict';

var lang = require('../../api/language');

describe('#language.js', function(){
    it('should return username', function(){
        request.get('/api/language').send({

        }).expect(200).end(function(err, res){
            done(err);
            chai.expect(res).to.equal("Username");
        });
    });
});