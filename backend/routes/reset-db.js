const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'mindwell.db');

// Delete old database
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('✅ Old database deleted');
}

// Create new database with fresh schema
const Database = require('better-sqlite3');
const db = new Database(dbPath);

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
        emergencyContact TEXT,
        therapistEmail TEXT,
        mentalHealthHistory TEXT,
        currentMedications TEXT,
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
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS crisis_alerts (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        alertType TEXT,
        severity TEXT,
        message TEXT,
        resolved INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS recommendations (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        category TEXT,
        title TEXT,
        description TEXT,
        completed INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS cbt_exercises (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        situation TEXT,
        automaticThought TEXT,
        emotion TEXT,
        evidence TEXT,
        balancedThought TEXT,
        outcome TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
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

// Seed resources
const { v4: uuidv4 } = require('uuid');
const resources = [
    ['breathing', '4-7-8 Breathing Technique', 'A calming breathing exercise for anxiety', 
     '1. Breathe in through your nose for 4 seconds\n2. Hold your breath for 7 seconds\n3. Exhale slowly through your mouth for 8 seconds\n4. Repeat 4 times', 5, 'exercise'],
    ['meditation', '5-Minute Mindfulness Meditation', 'Quick mindfulness practice', 
     '1. Sit comfortably and close your eyes\n2. Focus on your natural breathing\n3. Notice thoughts without judgment\n4. Gently return focus to breath\n5. Slowly open your eyes', 5, 'exercise'],
    ['cbt', 'Thought Challenging Worksheet', 'Challenge negative thought patterns', 
     'Step 1: Identify the negative thought\nStep 2: What evidence supports this thought?\nStep 3: What evidence contradicts it?\nStep 4: What would you tell a friend?\nStep 5: Write a balanced thought', 15, 'worksheet'],
    ['grounding', '5-4-3-2-1 Grounding Exercise', 'Ground yourself during anxiety', 
     'Name 5 things you can SEE\nName 4 things you can TOUCH\nName 3 things you can HEAR\nName 2 things you can SMELL\nName 1 thing you can TASTE', 3, 'exercise'],
    ['sleep', 'Sleep Hygiene Checklist', 'Improve your sleep quality', 
     '☐ Same bedtime/wake time daily\n☐ No screens 1 hour before bed\n☐ Cool, dark, quiet room\n☐ No caffeine after 2 PM\n☐ Relaxation routine before bed', 10, 'checklist'],
    ['gratitude', 'Gratitude Journal Prompt', 'Build positive thinking', 
     'Write down:\n1. Three things you are grateful for today\n2. One positive experience\n3. One thing you did well\n4. One person who helped you', 10, 'journal']
];

const insert = db.prepare('INSERT INTO resources (id, category, title, description, content, duration, type) VALUES (?, ?, ?, ?, ?, ?, ?)');
resources.forEach(r => insert.run(uuidv4(), ...r));

console.log('✅ New database created with all tables and seed data');
console.log('📊 Tables: users, moods, crisis_alerts, recommendations, cbt_exercises, resources');
console.log('📚 Resources seeded: ' + resources.length);