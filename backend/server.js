const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const moodRoutes = require('./routes/mood');
const reportsRoutes = require('./routes/reports');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use('/api/auth', authRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/reports', reportsRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'MindWell API Running' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('========================================');
    console.log('  SERVER RUNNING: http://localhost:' + PORT);
    console.log('========================================');
});