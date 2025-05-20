const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize SQLite database
const db = new sqlite3.Database("messages.db");

// Create tables if they don't exist
db.run(`CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  course TEXT NOT NULL,
  message TEXT NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);
db.run(`CREATE TABLE IF NOT EXISTS signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  course_year_section TEXT NOT NULL,
  birthday TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);
db.run(`CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  data TEXT NOT NULL
)`);

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const upload = multer({ dest: uploadsDir });
const uploadsMetaPath = path.join(__dirname, "uploads", "uploads.json");

// Helper to load and save uploads metadata
function loadUploadsMeta() {
  try {
    return JSON.parse(fs.readFileSync(uploadsMetaPath, "utf8"));
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

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Signup endpoint
app.post("/api/signup", (req, res) => {
  const { schoolId, fullName, courseYearSection, birthday } = req.body;
  if (!schoolId || !fullName || !courseYearSection || !birthday) {
    return res.status(400).json({ message: "All fields are required." });
  }
  db.run(
    `INSERT INTO signups (school_id, full_name, course_year_section, birthday) VALUES (?, ?, ?, ?)`,
    [schoolId, fullName, courseYearSection, birthday],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error." });
      }
      res.status(200).json({ message: "Signup successful!", id: this.lastID });
    }
  );
});

// View signups
app.get("/api/signups", (req, res) => {
  db.all(`SELECT * FROM signups ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error." });
    res.json(rows);
  });
});

// Upload endpoint
app.post("/api/upload", upload.single("upload-file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Didn't upload file" });

  let meta = loadUploadsMeta();
  // Remove any existing entry with the same filename or originalname
  meta = meta.filter(
    (f) =>
      f.filename !== req.file.filename &&
      f.originalname !== req.file.originalname
  );

  // Add the new file entry
  meta.push({
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    uploadedAt: new Date().toISOString(),
  });
  saveUploadsMeta(meta);

  res.json({
    message: "File uploaded successfully!",
    filename: req.file.filename,
  });
});

// List uploaded files
app.get("/api/resources", (req, res) => {
  let meta = loadUploadsMeta();
  res.json(meta);
});

// Serve uploaded files
app.use("/uploads", express.static(uploadsDir));

app.get("/api/download/:filename", (req, res) => {
  const meta = loadUploadsMeta();
  const fileMeta = meta.find((f) => f.filename === req.params.filename);
  if (!fileMeta) return res.status(404).send("File not found");
  const filePath = path.join(__dirname, "uploads", fileMeta.filename);
  res.download(filePath, fileMeta.originalname);
});

app.post("/api/delete-resource", (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.json({ success: false });
  const filePath = path.join(__dirname, "uploads", filename);
  let meta = loadUploadsMeta();
  meta = meta.filter((file) => file.filename !== filename);
  saveUploadsMeta(meta);
  fs.unlink(filePath, (err) => {
    if (err) return res.json({ success: false });
    res.json({ success: true });
  });
});

// Contact message endpoint
app.post("/api/contact", (req, res) => {
  const { name, course, message } = req.body;
  if (!name || !course || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }
  db.run(
    "INSERT INTO messages (name, course, message) VALUES (?, ?, ?)",
    [name, course, message],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error." });
      }
      res.json({ message: "Message sent successfully!" });
    }
  );
});

// Get contact messages
app.get("/api/contact/messages", (req, res) => {
  db.all("SELECT * FROM messages ORDER BY date DESC", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error." });
    }
    res.json(rows);
  });
});

// Get profile for a user
app.get("/api/profile/:username", (req, res) => {
  db.get(
    "SELECT data FROM profiles WHERE username = ?",
    [req.params.username],
    (err, row) => {
      if (err) return res.status(500).json({ message: "Database error." });
      if (!row) return res.json(null);
      res.json(JSON.parse(row.data));
    }
  );
});

// Save/update profile for a user
app.post("/api/profile/:username", (req, res) => {
  const data = JSON.stringify(req.body);
  db.run(
    `INSERT INTO profiles (username, data) VALUES (?, ?)
     ON CONFLICT(username) DO UPDATE SET data=excluded.data`,
    [req.params.username, data],
    function (err) {
      if (err) return res.status(500).json({ message: "Database error." });
      res.json({ message: "Profile saved!" });
    }
  );
});

// Protected clear signups endpoint (for development/testing only)
app.post("/api/clear-signups", (req, res) => {
  const adminToken = req.headers["x-admin-token"];
  const SECRET = process.env.ADMIN_CLEAR_TOKEN || "yuehanadminlangmalakas";

  if (adminToken !== SECRET) {
    return res.status(403).json({ message: "Forbidden: Invalid admin token." });
  }

  db.run("DELETE FROM signups", function (err) {
    if (err) {
      return res.status(500).json({ message: "Failed to clear signups." });
    }
    res.json({ message: "All signups cleared." });
  });
});

app.delete('/api/resources/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  console.log('Attempting to delete:', filePath);
  fs.unlink(filePath, err => {
    if (err) {
      console.error('Delete failed:', err);
      return res.status(500).json({ message: 'Delete failed.' });
    }

    // Remove the file entry from uploads.json
    let meta = loadUploadsMeta();
    meta = meta.filter(file => file.filename !== filename);
    saveUploadsMeta(meta);

    res.json({ message: 'File deleted.' });
  });
});

app.delete('/api/contact/messages/:id', (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM messages WHERE id = ?", [id], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error." });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Message not found." });
    }
    res.json({ message: "Message deleted." });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
