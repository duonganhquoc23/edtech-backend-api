require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

// Cấu hình CORS và JSON middleware
app.use(cors());
app.use(express.json());

// API Nhận dữ liệu từ Người chơi lưu vào MySQL
app.post('/api/sync', async (req, res) => {
    const { id, name, class_name, avatar, level, xp } = req.body;
    try {
        const query = `
            INSERT INTO users (id, name, class_name, avatar, level, xp) 
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            name = VALUES(name), class_name = VALUES(class_name), 
            avatar = VALUES(avatar), level = VALUES(level), xp = VALUES(xp)
        `;
        await db.query(query, [id || null, name, class_name, avatar, level, xp]);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server API đang chạy tại http://localhost:${PORT}`));