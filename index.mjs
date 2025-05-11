import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { Pool } from 'pg';
import fs from 'fs';

// Initialize express
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploaded files
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

// PostgreSQL Database connection
const db = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'Soumyadev@11',
  database: 'bill_db',
  port: 5432, // default PostgreSQL port
});

db.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('PostgreSQL connection error:', err.stack));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// === ROUTES ===

// Registration Route
app.post('/register', async (req, res) => {
  const { name, designation, department, kpmgId, location, email, password } = req.body;

  if (!name || !designation || !department || !kpmgId || !location || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO users (name, designation, department, kpmgId, location, email, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    const insertValues = [name, designation, department, kpmgId, location, email, hashedPassword];

    const insertResult = await db.query(insertQuery, insertValues);

    const token = jwt.sign({ id: insertResult.rows[0].id }, 'your_jwt_secret', { expiresIn: '1h' });

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// File Upload Route
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.status(200).json({
    message: 'File uploaded successfully!',
    filePath: `/uploads/${req.file.filename}`,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
