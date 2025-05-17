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