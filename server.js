const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Railway sets this automatically
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const upload = multer({ dest: uploadsDir });
const uploadsMetaPath = path.join(__dirname, 'uploads', 'uploads.json');

const messagesPath = path.join(__dirname, 'contact/messages.json');

function loadMessages() {
  try {
    return JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
  } catch {
    return [];
  }
}
function saveMessages(messages) {
  fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));
}

// Helper to load and save uploads metadata
function loadUploadsMeta() {
  try {
    return JSON.parse(fs.readFileSync(uploadsMetaPath, 'utf8'));
  } catch {
    return [];
  }
}
function saveUploadsMeta(meta) {
  fs.writeFileSync(uploadsMetaPath, JSON.stringify(meta, null, 2));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

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

// Upload endpoint (for instructors)
app.post('/api/upload', upload.single('upload-file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Didn't upload file" });

  let meta = loadUploadsMeta();

  // Remove any existing entry with the same filename or originalname
  meta = meta.filter(f => f.filename !== req.file.filename && f.originalname !== req.file.originalname);

  // Add the new file entry
  meta.push({
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    uploadedAt: new Date().toISOString()
  });
  saveUploadsMeta(meta);

  res.json({ message: 'File uploaded successfully!', filename: req.file.filename });
});

// List uploaded files (for all users)
app.get('/api/resources', (req, res) => {
  let meta = loadUploadsMeta();
  res.json(meta);
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

app.get('/api/download/:filename', (req, res) => {
  const meta = loadUploadsMeta();
  const fileMeta = meta.find(f => f.filename === req.params.filename);
  if (!fileMeta) return res.status(404).send('File not found');
  const filePath = path.join(__dirname, 'uploads', fileMeta.filename);
  res.download(filePath, fileMeta.originalname);
});

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

app.post('/api/contact', async (req, res) => {
  const { name, course, message } = req.body;
  if (!name || !course || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    await pool.query(
      'INSERT INTO messages (name, course, message) VALUES ($1, $2, $3)',
      [name, course, message]
    );
    res.json({ message: 'Message sent successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error.' });
  }
});

app.get('/api/contact/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error.' });
  }
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});