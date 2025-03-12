const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 2000;
const mysql = require("mysql2");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Enable Cross-Origin Resource Sharing (CORS) for the application
app.use(cors({
    origin: '*',  // // Allow all origins (not recommended for production; specify allowed origins instead)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Define allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Specify allowed headers in CORS requests
}));

app.use("/api/upload", express.static("uploads"));

app.use(express.json({ limit : '10mb'}));
// app.use('/uploads', express.static('uploads'));

 // MySQL Connection
  const db = mysql.createConnection({
    host : 'localhost',
    user: 'sophindb',
    password: 'Goodluck123@',
    database : 'file_sharing'
  })

  db.connect(function(err){
    if (err) throw err;
    console.log("connection as id " + db.threadId);
  })

  // Create table if not exist
  try {
    const createTableQuery = `CREATE TABLE
        if NOT EXISTS files (
        id INT PRIMARY KEY auto_increment,
        filename VARCHAR(255) NOT NULL,
        filetype VARCHAR(50) NOT NULL,
        filepath VARCHAR(255) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`

    db.execute(createTableQuery)
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
const upload = multer({storage, limits: {
  fileSize: 10 * 1024 * 1024
}})

// Upload endpoint
app.post("/api/upload", upload.single('file'), (req, res) => {
  const {filename, path: filepath,  mimetype } = req.file

  const q = 'INSERT INTO files (filename, filepath, filetype) VALUES (?, ?, ?)';

  db.query(q, [filename, filepath, mimetype], (err, result) => {
    if(err) return res.status(500).json(err);
    res.status(200).json({message : "File Uploaded Successfully"})
  })
})

// Get files endpoint
app.get("/api/files", (req, res) => {
  const q = 'SELECT * FROM files ORDER BY uploaded_at DESC';

  db.query(q, (err, result) => {
    if(result.length === 0){
      return res.status(200).json([]);
    }

    if(err) return res.status(500).json(err);
    res.status(200).json(result);
  })
})

// Delete file endpoint
app.delete("/api/file/:id", (req, res) => {

  const q = 'SELECT * FROM files WHERE id = ?';
  db.query(q, [req.params.id], (err, result) => {
    if(err) return res.status(500).json(err);

    const filename = result[0].filename;
    const filepath = result[0].filepath;
    fs.unlink(filepath, (err) => {
      if(err) console.error(err);

      const q = 'DELETE FROM files WHERE id = ?';
      db.query(q, [req.params.id], (err, result) => {
        if(err) return res.status(500).json(err);

        res.status(200).json({message : `${filename} Deleted Successfully`})
      })
    })   
  })
})

// Download endpoint
app.get('/download/:filename', (req, res) => {
  const file = `${__dirname}/uploads/${req.params.filename}`;
  console.log("file", file);

  // This sets the Content-Disposition header
  res.download(file); 
});

// Define a simple route
app.get('/', (req, res) => {
    res.send({ "message": 'Hello from the backend!' });
  });

// App listening at specific port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
  
