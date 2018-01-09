'use strict';

var chai = require('chai');
var lang = require('../../api/language');

describe('#language', function(){
    it('should return hei', function(){
        var res = lang();
        chai.expect(res).to.equal("hei");
    });
});