const constants = require('../config');
const mysql = require('mysql');

const pool = mysql.createPool({
    database: constants.db.DATABASE_NAME,
    host: constants.db.DATABASE_IP,
    multipleStatements: true,
    password: constants.db.DATABASE_PASSWORD,
    port: constants.db.DATABASE_PORT,
    user: constants.db.DATABASE_USER
});

module.exports.getConnection = (callback) => {
    pool.getConnection((err, connection) => {
        callback(err, connection);
    });
};