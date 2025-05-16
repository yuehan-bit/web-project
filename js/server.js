const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/api/signup', (req, res) => {
  const { schoolId, fullName, courseYearSection } = req.body;
  const logLine = `${new Date().toISOString()},${schoolId},${fullName},${courseYearSection}\n`;
  fs.appendFile(path.join(__dirname, 'signups.log'), logLine, err => {
    if (err) {
      return res.status(500).json({ message: 'Failed to log signup.' });
    }
    res.status(200).json({ message: 'Signup logged.' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});