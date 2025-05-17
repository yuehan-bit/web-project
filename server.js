const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const db2 = require('./db2.js');
const bcrypt = require('bcrypt');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

const uploadsMetaPath = path.join(__dirname, 'uploads', 'uploads.json');

// Helper: Load uploads metadata
function loadUploadsMeta() {
    if (!fs.existsSync(uploadsMetaPath)) return [];
    return JSON.parse(fs.readFileSync(uploadsMetaPath, 'utf8'));
}

// Helper: Save uploads metadata
function saveUploadsMeta(meta) {
    fs.writeFileSync(uploadsMetaPath, JSON.stringify(meta, null, 2));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, images) from the parent directory
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Signup endpoint
app.post('/api/signup', (req, res) => {
  const { schoolId, fullName, courseYearSection, birthday } = req.body;
  if (!schoolId || !fullName || !courseYearSection || !birthday) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  db.run(
    `INSERT INTO signups (school_id, full_name, course_year_section, birthday) VALUES (?, ?, ?, ?)`,
    [schoolId, fullName, courseYearSection, birthday],
    function (err) {
      if (err) {
        console.error(err); // <--- Add this for debugging
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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads/'));
  },
  filename: function (req, file, cb) {
    // Save with a unique timestamp + original extension
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${base}-${unique}${ext}`);
  }
});
const upload = multer({ storage: storage });

// Upload endpoint (for instructors)
app.post('/api/upload', upload.single('upload-file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    // Save metadata
    let meta = loadUploadsMeta();
    meta.push({
        filename: req.file.filename,
        originalname: req.file.originalname,
        uploadedAt: new Date().toISOString()
    });
    saveUploadsMeta(meta);

    res.json({ filename: req.file.filename, originalname: req.file.originalname });
});

// List uploaded files (for all users)
app.get('/api/resources', (req, res) => {
    let meta = loadUploadsMeta();
    res.json(meta.reverse()); // newest first
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/api/delete-resource', (req, res) => {
    const { filename } = req.body;
    if (!filename) return res.json({ success: false });
    const filePath = path.join(__dirname, 'uploads', filename);
    let meta = loadUploadsMeta();
    meta = meta.filter(file => file.filename !== filename);
    saveUploadsMeta(meta);
    fs.unlink(filePath, err => {
        if (err) return res.json({ success: false });
        res.json({ success: true });
    });
});

// Protected clear signups endpoint (for development/testing only)
app.post('/api/clear-signups', (req, res) => {
  // Simple protection: require a secret token in the request header
  const adminToken = req.headers['x-admin-token'];
  const SECRET = process.env.ADMIN_CLEAR_TOKEN || 'yuehanadminlangmalakas'; // Set this in Railway environment variables

  if (adminToken !== SECRET) {
    return res.status(403).json({ message: 'Forbidden: Invalid admin token.' });
  }

  db.run('DELETE FROM signups', function(err) {
    if (err) {
      return res.status(500).json({ message: 'Failed to clear signups.' });
    }
    res.json({ message: 'All signups cleared.' });
  });
});

app.post('/api/users', async (req, res) => {
  const { username, password, email, firstName, lastName } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  db2.run(
    `INSERT INTO users (username, password, email, firstName, lastName) VALUES (?, ?, ?, ?, ?)`,
    [username, hashedPassword, email, firstName, lastName],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(409).json({ message: 'Username already exists.' });
        }
        return res.status(500).json({ message: 'Database error.' });
      }
      res.status(201).json({ message: 'User created!', userId: this.lastID });
    }
  );
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) return res.status(401).json({ message: 'Invalid credentials.' });
    const match = await require('bcrypt').compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' });
    // In production, set a session or return a JWT token here
    res.json({ message: 'Login successful!', userId: user.id, username: user.username });
  });
});

app.get('/api/users/:id', (req, res) => {
  db.get('SELECT id, username, email, firstName, lastName, profile_pic FROM users WHERE id = ?', [req.params.id], (err, user) => {
    if (err || !user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  });
});

app.put('/api/users/:id', (req, res) => {
  const { email, firstName, lastName } = req.body;
  db.run(
    'UPDATE users SET email = ?, firstName = ?, lastName = ? WHERE id = ?',
    [email, firstName, lastName, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ message: 'Database error.' });
      res.json({ message: 'Profile updated.' });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});