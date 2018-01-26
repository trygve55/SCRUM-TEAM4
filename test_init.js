var mysql = require('mysql');

app = require('./main');
Cookies = null;

chai = require('chai');
request = require('supertest-session')(app);

pool = mysql.createPool({
    connectionLimit : 2,
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'test',
    debug : false,
	typeCast: function castField( field, useDefaultTypeCasting ) {

        if ( ( field.type === "BIT" ) && ( field.length === 1 ) ) {
            var bytes = field.buffer();
            return( bytes[ 0 ] === 1 );
        }

        return( useDefaultTypeCasting() );
    }
});