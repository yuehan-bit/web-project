const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Store the database file in the same directory as this file
const dbPath = path.join(__dirname, 'signups.db');
const db = new sqlite3.Database(dbPath);

// Create table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_id TEXT,
      full_name TEXT,
      course_year_section TEXT,
      birthday TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;