const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, images) from the parent directory
app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Signup endpoint
app.post('/api/signup', (req, res) => {
  const { schoolId, fullName, courseYearSection } = req.body;
  if (!schoolId || !fullName || !courseYearSection) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  db.run(
    `INSERT INTO signups (school_id, full_name, course_year_section) VALUES (?, ?, ?)`,
    [schoolId, fullName, courseYearSection],
    function (err) {
      if (err) {
        return res.status(500).json({ message: 'Database error.' });
      }
      res.status(200).json({ message: 'Signup successful!', id: this.lastID });
    }
  );
});

// (Optional) Endpoint to view signups
app.get('/api/signups', (req, res) => {
  db.all(`SELECT * FROM signups ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error.' });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});