const express = require('express');
const router = express.Router();
const db = require('../database');
const { authMiddleware } = require('./auth');

router.use(authMiddleware);

// DASHBOARD STATS (For Wellness Officers)
router.get('/dashboard', (req, res) => {
    try {
        const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
        const totalMoods = db.prepare('SELECT COUNT(*) as count FROM moods').get();
        const avgMood = db.prepare('SELECT ROUND(AVG(score), 1) as avg FROM moods').get();
        
        // Mood trends (last 7 days)
        const trends = db.prepare(`
            SELECT 
                date(createdAt) as date,
                ROUND(AVG(score), 1) as avgMood,
                COUNT(*) as entries
            FROM moods 
            WHERE createdAt >= datetime('now', '-7 days')
            GROUP BY date(createdAt)
            ORDER BY date(createdAt)
        `).all();

        res.json({
            stats: {
                totalUsers: totalUsers.count,
                totalMoods: totalMoods.count,
                averageMood: avgMood.avg || 0
            },
            trends
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

module.exports = router;