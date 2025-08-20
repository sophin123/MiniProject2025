const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 2000;

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


app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/texts', snippetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/', mainRoutes);


// App listening at specific port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

