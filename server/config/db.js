const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or connect to local SQLite database
const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('SQLite connection error:', err.message);
    } else {
        console.log('SQLite Connected Successfully');
        
        // Initialize Tables
        db.serialize(() => {
            // Users Table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Monitoring Data Table
            db.run(`CREATE TABLE IF NOT EXISTS monitoring_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                location TEXT NOT NULL,
                pollutantType TEXT NOT NULL,
                value REAL NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            
            // Seed 3 rows of data if empty
            db.get("SELECT COUNT(*) as count FROM monitoring_data", (err, row) => {
                if (row && row.count === 0) {
                    const stmt = db.prepare("INSERT INTO monitoring_data (location, pollutantType, value) VALUES (?, ?, ?)");
                    stmt.run('Bilaspur', 'Air Quality (AQI)', 45.5);
                    stmt.run('Mumbai', 'PM 2.5', 89.0);
                    stmt.run('Delhi', 'Air Quality (AQI)', 156.0);
                    stmt.finalize();
                    console.log("Seeded database with initial monitoring data");
                }
            });
        });
    }
});

module.exports = db;
