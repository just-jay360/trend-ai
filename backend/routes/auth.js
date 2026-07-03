const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, age, gender, institution, role } = req.body;
        const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (exists) return res.status(400).json({ message: 'Email already registered' });
        
        const hash = await bcrypt.hash(password, 10);
        const id = uuidv4();
        db.prepare('INSERT INTO users (id,fullName,email,password,age,gender,institution,role) VALUES (?,?,?,?,?,?,?,?)')
            .run(id, fullName, email, hash, age||null, gender||null, institution||null, role||null);
        
        const token = jwt.sign({ userId: id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ message: 'Registered', token, user: { id, fullName, email, role } });
    } catch(e) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
        
        const token = jwt.sign({ userId: user.id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ message: 'Logged in', token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
    } catch(e) { res.status(500).json({ message: 'Server error' }); }
});

const authMiddleware = (req, res, next) => {
    const t = req.headers.authorization?.split(' ')[1];
    if (!t) return res.status(401).json({ message: 'No token' });
    try { req.user = jwt.verify(t, process.env.JWT_SECRET); next(); }
    catch(e) { res.status(401).json({ message: 'Invalid token' }); }
};

module.exports = router;
module.exports.authMiddleware = authMiddleware;
