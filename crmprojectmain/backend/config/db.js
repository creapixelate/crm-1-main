const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // তোমার MySQL password এখানে দাও
    database: 'maincreapixelatecrm'
});

module.exports = pool;
