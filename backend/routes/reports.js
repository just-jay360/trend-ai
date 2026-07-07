const express = require('express');
const router = express.Router();
const db = require('../database');
const { authMiddleware } = require('./auth');

router.use(authMiddleware);

router.get('/mental-health', (req, res) => {
    try {
        const userId = req.user.userId;
        const user = db.prepare('SELECT * FROM users WHERE id=?').get(userId);
        const moods = db.prepare('SELECT * FROM moods WHERE userId=? ORDER BY createdAt DESC LIMIT 90').all(userId);
        const stats = db.prepare('SELECT COUNT(*) as total, ROUND(AVG(score),1) as avgMood, ROUND(AVG(depressionScore),1) as avgDepression, ROUND(AVG(anxietyScore),1) as avgAnxiety, ROUND(AVG(stressScore),1) as avgStress, ROUND(AVG(sleepHours),1) as avgSleep, ROUND(AVG(energyLevel),1) as avgEnergy, ROUND(AVG(socialInteraction),1) as avgSocial FROM moods WHERE userId=?').get(userId);
        const alerts = db.prepare('SELECT * FROM crisis_alerts WHERE userId=?').all(userId);
        const recs = db.prepare('SELECT * FROM recommendations WHERE userId=? AND completed=0').all(userId);

        let trend = 'stable';
        if (moods.length >= 6) {
            const r = moods.slice(0, 3);
            const o = moods.slice(-3);
            const ra = r.reduce((s, m) => s + m.score, 0) / 3;
            const oa = o.reduce((s, m) => s + m.score, 0) / 3;
            if (ra > oa + 1) trend = 'improving';
            else if (ra < oa - 1) trend = 'declining';
        }

        let dRisk = 'low';
        let aRisk = 'low';
        if (stats.avgDepression >= 7) dRisk = 'high';
        else if (stats.avgDepression >= 5) dRisk = 'moderate';
        if (stats.avgAnxiety >= 7) aRisk = 'high';
        else if (stats.avgAnxiety >= 5) aRisk = 'moderate';

        res.json({
            report: {
                generatedAt: new Date().toISOString(),
                user: {
                    name: user.fullName,
                    age: user.age,
                    institution: user.institution
                },
                summary: {
                    totalEntries: stats.total,
                    averageMood: stats.avgMood,
                    trend,
                    depressionRisk: dRisk,
                    anxietyRisk: aRisk,
                    crisisAlerts: alerts.length
                },
                statistics: stats,
                activeRecommendations: recs,
                crisisHistory: alerts,
                resources: {
                    crisis: 'Call 112 for help. Text HELP to 08062106493.',
                    message: trend === 'declining'
                        ? 'Mood declining - seek support.'
                        : trend === 'improving'
                            ? 'Mood improving!'
                            : 'Mood stable.'
                }
            }
        });
    } catch (e) {
        res.status(500).json({ message: 'Error: ' + e.message });
    }
});

module.exports = router;
