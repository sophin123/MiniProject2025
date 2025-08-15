const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 2000;
const mysql = require("mysql2");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/auth.js');
const jwt = require('jsonwebtoken');
const verifyToken = require('./routes/verifyToken.js');

require('dotenv').config();

// Define upload directory path
const UPLOAD_DIR = path.join(__dirname, "uploads");

// Create directory if it doesn't exist
const createUploadDir = () => {
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log(`Upload directory created at: ${UPLOAD_DIR}`);
  } catch (err) {
    console.error(`Error creating upload directory: ${err.message}`);
  }
};

// Call this function during server startup
createUploadDir();

// Add middleware to check directory before upload
const ensureUploadDir = (req, res, next) => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    createUploadDir();
  }
  next();
};

// Enable Cross-Origin Resource Sharing (CORS) for the application
app.use(cors({
  origin: '*',  // // Allow all origins (not recommended for production; specify allowed origins instead)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Define allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Specify allowed headers in CORS requests
}));

app.use("/api/upload", express.static("uploads"));

app.use(express.json({ limit: '10mb' }));
// app.use('/uploads', express.static('uploads'));
// console.log("User:", process.env.MYSQL_USER);
// console.log("Database :", process.env.MYSQL_DATABASE);

app.use('/api/auth', authRoutes);


// MySQL Connection
const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: "root",
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: "fileshare",
  waitForConnections: true,
  connectionLimit: 2,
  queueLimit: 0
})


db.getConnection((err, connection) => {
  if (err) {
    console.log("Error Connecting DB", err);
  }

  console.log("Your connection ID is " + connection.threadId);

  connection.release();
}
)

// Create table if not exist
try {
  const createTableQuery = `CREATE TABLE
        if NOT EXISTS files (
        id INT PRIMARY KEY auto_increment,
        user_id INT NOT NULL,
        filename VARCHAR(255) NOT NULL,
        filetype VARCHAR(50) NOT NULL,
        filepath VARCHAR(255) NOT NULL,
        size INT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES authentication.users(id) ON DELETE CASCADE
  )`

  // Create snippet table if not exists
  const createSnippetTableQuery = `CREATE TABLE 
        IF NOT EXISTS snippets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES authentication.users(id) ON DELETE CASCADE
  )`;


  db.execute(createTableQuery, (err, result) => {
    if (err) {
      console.error("Error creating files table:", err);
    } else {
      console.log("Files table created or already exists.");
    }
  });

  db.execute(createSnippetTableQuery, (err, result) => {
    if (err) {
      console.log("Error creating snippet tables".err);
    } else {
      console.log("Snippet table already exist");
    }

  })
} catch (error) {
  console.error("Error creating table", error)

}

// File Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const fileExtension = file.originalname.split(".").pop();
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + fileExtension);
  }
})

// Upload files in storage
const upload = multer({
  storage, limits: {
    fileSize: 100 * 1024 * 1024
  }
})

// Upload endpoint
app.post("/api/upload", verifyToken, ensureUploadDir, upload.single('file'), (req, res) => {
  const { filename, path: filepath, mimetype, size } = req.file

  const q = 'INSERT INTO files (user_id, filename, filepath, filetype, size) VALUES (?, ?, ?, ?, ?)';

  db.query(q, [req.user.userId, filename, filepath, mimetype, size], (err, result) => {
    if (err) return res.status(500).json({ "Custom Error": err });
    res.status(200).json({ message: "File Uploaded Successfully" })
  })
})

// Get files endpoint
app.get("/api/files", verifyToken, (req, res) => {
  const userId = req.user.userId;

  console.log("Getting files based on user id", userId);
  const q = 'SELECT * FROM files WHERE user_id = ? ORDER BY uploaded_at DESC';

  db.query(q, [userId], (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database error occurred" });
    }

    if (result.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(result);
  })
})

// Delete file endpoint
app.delete("/api/file/:id", (req, res) => {

  console.log("Delete id is", req.params.id);

  const q = 'SELECT * FROM files WHERE id = ?';
  db.query(q, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);


    const filename = result[0].filename;
    const filepath = result[0].filepath;
    fs.unlink(filepath, (err) => {
      if (err) console.error(err);

      const q = 'DELETE FROM files WHERE id = ?';
      db.query(q, [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);

        res.status(200).json({ message: `${filename} Deleted Successfully` })
      })
    })
  })
})

// Download endpoint
app.get('/api/download/:filename', (req, res) => {
  const file = `${__dirname}/uploads/${req.params.filename}`;
  console.log("file", file);

  // This sets the Content-Disposition header
  res.download(file);
});

app.get('/api/dashboard', (req, res) => {
  // This is a placeholder for your dashboard logic
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded.userId);
    res.status(200).json({ message: "Dashboard data", user: decoded });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

// Snippet API

// Get Snippet API
app.get('/api/texts', verifyToken, (req, res) => {

  const userId = req.user.userId;

  const q = 'SELECT * FROM snippets WHERE user_id = ? ORDER BY created_at DESC';

  db.query(q, [userId], (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database error occurred" });
    }

    if (result.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(result);
  })

})


// Upload snippet endpoint
app.post("/api/textupload", verifyToken, (req, res) => {

  const { text } = req.body;

  const q = 'INSERT INTO snippets (user_id, text) VALUES (?, ?)';

  db.query(q, [req.user.userId, text], (err, result) => {
    if (err) return res.status(500).json({ "Custom Error": err });
    res.status(200).json({ message: "Text Added Successfully" })
  })
})

// Delete snippet endpoint
app.delete("/api/text/:id", (req, res) => {

  console.log("Delete id is", req.params.id);

  const q = 'DELETE FROM snippets WHERE id = ?';

  db.query(q, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);


    res.status(200).json({ message: `Deleted Successfully` })
  })
})


// Define a simple route
app.get('/', (req, res) => {
  res.send({ "message": 'Hello from the backend!' });
});



// App listening at specific port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

