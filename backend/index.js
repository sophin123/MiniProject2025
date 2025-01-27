import "dotenv/config";

import express from "express";
import mysql from "mysql2";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const app = express();

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `uploads/${file.originalname}-${Date.now()}.${ext}`);
  },
});

const upload = multer({
  storage: storage,
});

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL");
});

// Create table
db.query(
  `CREATE TABLE IF NOT EXISTS bookimages (id INT AUTO_INCREMENT PRIMARY KEY, cover VARCHAR(255) NOT NULL)`,
  (err) => {
    if (err) throw err;
  }
);

// Get Images
app.get("/images", (req, res) => {
  const q = "SELECT * FROM bookimages;";

  db.query(q, (err, result) => {
    if (err) {
      res.send({ msg: err });
    }

    if (result) {
      res.send({
        image: result,
      });
    }
  });
});

// Upload Image
app.post("/upload", upload.single("image"), (req, res, err) => {
  if (!req.file) {
    return res.status(400).json({ msg: "No file uploaded" });
  }

  if (!req.file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    return res.send({ msg: "Only image files (jpg, jpeg, png) are allowed!" });
  } else {
    const image = req.file.filename;
    const q = "INSERT into bookimages (cover) VALUES (?);";

    db.query(q, [image], (err, result) => {
      if (err) {
        return res.json({ msg: "Failed to upload image" });
      }

      if (result) {
        console.log("result", result);
        return res.status(200).json({
          result: result,
          msg: "Image uploaded successfully",
        });
      }
    });
  }
});

const PORT = 8080;
app.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`Server is running on port ${PORT}`);
});
