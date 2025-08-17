const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 2000;
const mysql = require("mysql2");

const authRoutes = require('./routes/auth.js');
const fileRoutes = require('./routes/files.js');
const snippetRoutes = require('./routes/snippets.js');
const dashboardRoutes = require('./routes/dashboard.js');
const mainRoutes = require('./routes/main.js');
const queries = require('./files/queries.js');

require('dotenv').config();

// Enable Cross-Origin Resource Sharing (CORS) for the application
app.use(cors({
  origin: '*',  // // Allow all origins (not recommended for production; specify allowed origins instead)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Define allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Specify allowed headers in CORS requests
}));

app.use(express.json({ limit: '10mb' }));
// app.use('/uploads', express.static('uploads'));
// console.log("User:", process.env.MYSQL_USER);
// console.log("Database :", process.env.MYSQL_DATABASE);

// MySQL Connection
const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: "root",
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: "fileshare",
  waitForConnections: true,
  connectionLimit: 2,
  queueLimit: 0
});

// Make database connection available to all routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/texts', snippetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/', mainRoutes);


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
  db.execute(queries.CREATE_FILES_TABLE, (err, result) => {
    if (err) {
      console.error("Error creating files table:", err);
    } else {
      console.log("Files table created or already exists.");
    }
  });

  db.execute(queries.CREATE_SNIPPETS_TABLE, (err, result) => {
    if (err) {
      console.log("Error creating snippet tables:", err);
    } else {
      console.log("Snippet table already exists");
    }
  });
} catch (error) {
  console.error("Error creating table", error);
}

// App listening at specific port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

