const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    ca: fs.readFileSync(
      isProduction
        ? process.env.DB_CA                      // Render server path
        : path.join(__dirname, '..', 'config', 'isrgrootx1.pem')  // Local path
    )
  }
});

module.exports = pool;
