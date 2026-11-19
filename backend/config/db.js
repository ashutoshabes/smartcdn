const mysql = require('mysql2');
require('dotenv').config();

// Creates a "pool" of reusable connections instead of opening
// a brand new connection for every single query — much faster
// and is the standard approach for a real backend.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// .promise() lets us use async/await instead of callback functions
const db = pool.promise();

module.exports = db;