const mysql = require('mysql2'); // Import mysql2 murni
require('dotenv').config();

// Buat pool koneksi seperti biasa
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// KUNCI PERBAIKAN: Ubah pool menjadi berbasis Promise agar mendukung .execute() asinkronus
const poolPromise = pool.promise();

module.exports = poolPromise;