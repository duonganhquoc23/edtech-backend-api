require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

// Cấu hình CORS và JSON middleware
app.use(cors());
app.use(express.json());

// API Nhận dữ liệu từ Người chơi lưu vào MySQL
// API Nhận dữ liệu từ Người chơi lưu vào MySQL
app.post('/api/sync', async (req, res) => {
    // Mình không lấy 'id' từ req.body nữa
    const { name, class_name, avatar, level, xp } = req.body;
    try {
        // Bỏ cột id đi, để MySQL tự sinh số thứ tự tự động
        const query = `
            INSERT INTO users (name, class_name, avatar, level, xp) 
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            class_name = VALUES(class_name), 
            avatar = VALUES(avatar), level = VALUES(level), xp = VALUES(xp)
        `;
        // Truyền đủ 5 biến (bỏ biến id)
        await db.query(query, [name, class_name, avatar, level, xp]);
        res.status(200).json({ message: 'Đồng bộ thành công' });
    } catch (error) {
        console.error("Lỗi đồng bộ:", error);
        res.status(500).json({ error: error.message });
    }
});
// API Trả dữ liệu cho Admin hiển thị
app.get('/api/leaderboard', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM users ORDER BY xp DESC");
        res.status(200).json(rows);
    } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
        res.status(500).json({ error: error.message });
    }
});

// API tạm thời để tạo bảng CSDL (chỉ cần chạy 1 lần)
app.get('/api/setup', async (req, res) => {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
                class_name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
                avatar VARCHAR(255),
                level INT DEFAULT 1,
                xp INT DEFAULT 0,
                last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        await db.query(createTableQuery);
        res.status(200).send("🎉 TUYỆT VỜI! Đã tạo bảng users thành công. Hãy quay lại trang Admin và ấn F5 nhé!");
    } catch (error) {
        console.error("Lỗi tạo bảng:", error);
        res.status(500).send("Lỗi tạo bảng: " + error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server API đang chạy tại http://localhost:${PORT}`));