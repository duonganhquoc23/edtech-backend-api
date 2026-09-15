const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edtech_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(() => console.log('✅ Đã kết nối thành công với MySQL Workbench!'))
    .catch((err) => console.error('❌ Lỗi kết nối MySQL:', err.message));

module.exports = pool;