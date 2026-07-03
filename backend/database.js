const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'mindwell.db'));
db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        fullName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        institution TEXT,
        role TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS moods (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        score INTEGER NOT NULL,
        depressionScore INTEGER,
        anxietyScore INTEGER,
        stressScore INTEGER,
        energyLevel INTEGER,
        sleepHours REAL,
        sleepQuality INTEGER,
        appetite INTEGER,
        concentration INTEGER,
        socialInteraction INTEGER,
        context TEXT,
        tags TEXT,
        note TEXT,
        crisisFlag INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS crisis_alerts (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        alertType TEXT,
        severity TEXT,
        message TEXT,
        resolved INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS recommendations (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        category TEXT,
        title TEXT,
        description TEXT,
        priority TEXT,
        completed INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS resources (
        id TEXT PRIMARY KEY,
        category TEXT,
        title TEXT,
        description TEXT,
        content TEXT,
        duration INTEGER,
        type TEXT
    );
`);

const { v4: uuidv4 } = require('uuid');
const count = db.prepare('SELECT COUNT(*) as c FROM resources').get();
if (count.c === 0) {
    const insert = db.prepare('INSERT INTO resources VALUES (?,?,?,?,?,?,?)');
    const r = [
        [uuidv4(),'breathing','4-7-8 Breathing','Calm anxiety quickly','Breathe in 4s, hold 7s, exhale 8s. Repeat 4 times.',5,'exercise'],
        [uuidv4(),'meditation','Mindfulness Meditation','5-minute calm','Sit quietly. Focus on breath. Notice thoughts.',5,'exercise'],
        [uuidv4(),'grounding','5-4-3-2-1 Exercise','Stop panic attacks','Name 5 see, 4 touch, 3 hear, 2 smell, 1 taste.',3,'exercise'],
        [uuidv4(),'cbt','Thought Challenge','CBT worksheet','1.Negative thought\n2.Evidence for\n3.Evidence against\n4.Balanced thought',15,'worksheet'],
        [uuidv4(),'sleep','Sleep Hygiene','Better sleep','Same bedtime. No screens 1hr before. Cool dark room.',10,'checklist'],
        [uuidv4(),'gratitude','Gratitude Journal','Build positivity','Write 3 grateful things, 1 good moment, 1 win today.',5,'journal']
    ];
    r.forEach(x => insert.run(...x));
}

module.exports = db;
console.log('Database ready');
