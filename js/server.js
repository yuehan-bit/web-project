const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5500;

app.use(express.json());

// Serve static files (HTML, CSS, JS, images) from the parent directory
app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.post('/api/signup', (req, res) => {
  const { schoolId, fullName, courseYearSection } = req.body;
  const logLine = `${new Date().toISOString()}, ${schoolId}, ${fullName}, ${courseYearSection}\n`;
  fs.appendFile(path.join(__dirname, 'signups.log'), logLine, err => {
    if (err) {
      return res.status(500).json({ message: 'Failed to log signup.' });
    }
    res.status(200).json({ message: 'Signup logged.' });
  });
});

app.get('/api/signups', (req, res) => {
  const logPath = path.join(__dirname, 'signups.log');
  fs.readFile(logPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).send('No signups found.');
    }
    res.type('text/plain').send(data);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});