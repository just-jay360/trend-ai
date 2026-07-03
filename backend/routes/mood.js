const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authMiddleware } = require('./auth');
router.use(authMiddleware);

router.post('/', (req, res) => {
    try {
        const { score, depressionScore, anxietyScore, stressScore, energyLevel, sleepHours, sleepQuality, appetite, concentration, socialInteraction, context, tags, note } = req.body;
        const userId = req.user.userId;
        const id = uuidv4();
        
        let crisis = 0, crisisMsg = '';
        if (score <= 1) { crisis = 1; crisisMsg = 'Very low mood detected'; }
        if (note && /suicide|kill myself|want to die|self harm|end my life/i.test(note)) { crisis = 1; crisisMsg = 'Crisis keywords in notes'; }
        
        db.prepare(`INSERT INTO moods (id,userId,score,depressionScore,anxietyScore,stressScore,energyLevel,sleepHours,sleepQuality,appetite,concentration,socialInteraction,context,tags,note,crisisFlag) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
            .run(id, userId, score, depressionScore||null, anxietyScore||null, stressScore||null, energyLevel||null, sleepHours||null, sleepQuality||null, appetite||null, concentration||null, socialInteraction||null, context||null, JSON.stringify(tags||[]), note||null, crisis);
        
        if (crisis) {
            db.prepare('INSERT INTO crisis_alerts (id,userId,alertType,severity,message) VALUES (?,?,?,?,?)')
                .run(uuidv4(), userId, 'crisis', 'high', crisisMsg);
        }
        
        const recs = [];
        if (depressionScore >= 7) recs.push({cat:'depression',title:'Seek Support',desc:'Your depression indicators are elevated. Consider talking to a professional.',priority:'high'});
        if (anxietyScore >= 7) recs.push({cat:'anxiety',title:'Practice Breathing',desc:'Try 4-7-8 breathing to reduce anxiety.',priority:'high'});
        if (sleepHours < 6) recs.push({cat:'sleep',title:'Improve Sleep',desc:'Aim for 7+ hours of sleep for better mental health.',priority:'medium'});
        if (score >= 7) recs.push({cat:'general',title:'Great Day!',desc:'Your mood is good. Note what helped today.',priority:'low'});
        
        const ins = db.prepare('INSERT INTO recommendations (id,userId,category,title,description,priority) VALUES (?,?,?,?,?,?)');
        recs.forEach(r => ins.run(uuidv4(), userId, r.cat, r.title, r.desc, r.priority));
        
        res.status(201).json({ message: 'Mood saved', mood: { id, score }, crisis: crisis?{detected:true,message:crisisMsg}:{detected:false}, recommendations: recs });
    } catch(e) {
        console.error('Error:', e.message);
        res.status(500).json({ message: 'Error: ' + e.message });
    }
});

router.get('/', (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const moods = db.prepare("SELECT * FROM moods WHERE userId=? AND createdAt>=datetime('now','-'||?||' days') ORDER BY createdAt DESC").all(req.user.userId, days);
        res.json({ moods });
    } catch(e) { res.status(500).json({ message: 'Error' }); }
});

router.get('/stats', (req, res) => {
    try {
        const s = db.prepare('SELECT COUNT(*) as total, ROUND(AVG(score),1) as avgMood, ROUND(AVG(depressionScore),1) as avgDepression, ROUND(AVG(anxietyScore),1) as avgAnxiety, ROUND(AVG(stressScore),1) as avgStress, ROUND(AVG(sleepHours),1) as avgSleep FROM moods WHERE userId=?').get(req.user.userId);
        res.json({ stats: s });
    } catch(e) { res.status(500).json({ message: 'Error' }); }
});

router.get('/resources', (req, res) => {
    try {
        const resources = db.prepare('SELECT * FROM resources').all();
        res.json({ resources });
    } catch(e) { res.status(500).json({ message: 'Error' }); }
});

router.get('/recommendations', (req, res) => {
    try {
        const recs = db.prepare('SELECT * FROM recommendations WHERE userId=? ORDER BY createdAt DESC LIMIT 10').all(req.user.userId);
        res.json({ recommendations: recs });
    } catch(e) { res.status(500).json({ message: 'Error' }); }
});

router.get('/alerts', (req, res) => {
    try {
        const alerts = db.prepare('SELECT * FROM crisis_alerts WHERE userId=? ORDER BY createdAt DESC LIMIT 5').all(req.user.userId);
        res.json({ alerts });
    } catch(e) { res.status(500).json({ message: 'Error' }); }
});

module.exports = router;
