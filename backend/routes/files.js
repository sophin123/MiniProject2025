const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const verifyToken = require('../files/verifyToken.js');
const queries = require('../files/queries.js');

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
});

// Upload files in storage
const MAX_UPLOAD_SIZE = process.env.MAX_UPLOAD_SIZE_GB * 1024 * 1024 * 1024;

const upload = multer({
  storage,
  limits: {
    fileSize: { MAX_UPLOAD_SIZE }
  }
});

// Ensure upload directory exists
const ensureUploadDir = (req, res, next) => {
  const UPLOAD_DIR = path.join(__dirname, "../uploads");
  if (!fs.existsSync(UPLOAD_DIR)) {
    try {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      console.log(`Upload directory created at: ${UPLOAD_DIR}`);
    } catch (err) {
      console.error(`Error creating upload directory: ${err.message}`);
    }
  }
  next();
};

// Get files endpoint
router.get("/", verifyToken, (req, res) => {
  const userId = req.user.userId;

  console.log("Getting files based on user id", userId);

  req.db.query(queries.GET_FILES_BY_USER, [userId], (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database error occurred" });
    }

    if (result.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(result);
  });
});

// Upload endpoint
router.post("/", verifyToken, ensureUploadDir, (req, res, next) => {

  upload.array('files', 10)(req, res, err => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: "One or more files exceed the size limit." });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: "Unexpected file field." });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: "Upload failed due to server error." });
    }
    next();
  })
});


router.post("/", (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const uploadedFiles = [];
  const errors = [];

  let processedCount = 0;

  req.files.forEach((file) => {
    const { filename, path: filepath, mimetype, size } = file;

    req.db.query(queries.INSERT_FILE, [req.user.userId, filename, filepath, mimetype, size], (err, result) => {
      processedCount++;

      if (err) {
        errors.push({ filename, error: err.message });
      } else {
        uploadedFiles.push({ filename, success: true });
      }

      if (processedCount === req.files.length) {
        if (errors.length === 0) {
          res.status(200).json({
            message: `${uploadedFiles.length} file(s) uploaded successfully`,
            uploadedFiles
          });
        } else if (uploadedFiles.length === 0) {
          res.status(500).json({
            error: "All files failed to upload",
            errors
          });
        } else {
          res.status(207).json({
            message: `${uploadedFiles.length} file(s) uploaded successfully, ${errors.length} file(s) failed`,
            uploadedFiles,
            errors
          });
        }
      }
    });
  });
})

// Delete file endpoint
router.delete("/:id", verifyToken, (req, res) => {
  console.log("Delete id is", req.params.id);

  req.db.query(queries.GET_FILE_BY_ID, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);

    const filename = result[0].filename;
    const filepath = result[0].filepath;
    fs.unlink(filepath, (err) => {
      if (err) console.error(err);

      req.db.query(queries.DELETE_FILE_BY_ID, [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);

        res.status(200).json({ message: `${filename} Deleted Successfully` });
      });
    });
  });
});

// Download endpoint
router.get('/download/:filename', (req, res) => {
  const file = `${__dirname}/../uploads/${req.params.filename}`;
  console.log("file", file);

  // This sets the Content-Disposition header
  res.download(file);
});

// View endpoint - serves file for viewing in browser
router.get('/view/:filename', (req, res) => {
  const file = `${__dirname}/../uploads/${req.params.filename}`;
  console.log("viewing file", file);

  // Check if file exists
  if (!require('fs').existsSync(file)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Get file extension to determine content type
  const path = require('path');
  const ext = path.extname(file).toLowerCase();

  // Set appropriate content type based on file extension
  let contentType = 'application/octet-stream'; // default

  if (ext === '.pdf') contentType = 'application/pdf';
  else if (ext === '.txt') contentType = 'text/plain';
  else if (ext === '.html' || ext === '.htm') contentType = 'text/html';
  else if (ext === '.css') contentType = 'text/css';
  else if (ext === '.js') contentType = 'application/javascript';
  else if (ext === '.json') contentType = 'application/json';
  else if (ext === '.xml') contentType = 'application/xml';
  else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.gif') contentType = 'image/gif';
  else if (ext === '.svg') contentType = 'image/svg+xml';
  else if (ext === '.mp4') contentType = 'video/mp4';
  else if (ext === '.webm') contentType = 'video/webm';
  else if (ext === '.mp3') contentType = 'audio/mpeg';
  else if (ext === '.wav') contentType = 'audio/wav';

  // Set headers for viewing (not downloading)
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', 'inline'); // inline = view in browser

  // Stream the file
  const fs = require('fs');
  const stream = fs.createReadStream(file);
  stream.pipe(res);
});

module.exports = router;
