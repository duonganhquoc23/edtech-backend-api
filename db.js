const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    // ĐÂY LÀ DÒNG QUAN TRỌNG NHẤT ĐỂ KẾT NỐI VỚI AIVEN:
    ssl: {
        rejectUnauthorized: false 
    }
});

module.exports = pool;