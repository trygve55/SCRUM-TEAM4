var mysql = require('mysql');

pool = mysql.createPool({
    connectionLimit : 2, // maks antall koblinger
    host : 'mysql.stud.iie.ntnu.no',
    user : 'g_tdat2003_t4',
    password : 'bR3n8htW',
    database : 'g_tdat2003_t4',
    debug : false,
    typeCast: function castField( field, useDefaultTypeCasting ) {

        if ( ( field.type === "BIT" ) && ( field.length === 1 ) ) {
            var bytes = field.buffer();
            return( bytes[ 0 ] === 1 );
        }

        return( useDefaultTypeCasting() );
    }
});

module.exports = "";