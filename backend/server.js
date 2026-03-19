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


const http = require('http');
const { WebSocketServer } = require('ws');

// Create an HTTP server so we can attach a WebSocket server to it
const server = http.createServer(app);

// Create a WebSocket server that will handle /ws upgrades
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws, request) => {
  console.log('WebSocket client connected:', request.socket.remoteAddress);
  ws.send(JSON.stringify({ message: 'WebSocket connection established' }));

  ws.on('message', (message) => {
    console.log('WebSocket message received:', message.toString());
    // Echo back to client
    ws.send(`Echo: ${message}`);
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Handle upgrade requests (required for WebSocket proxying)
server.on('upgrade', (request, socket, head) => {
  if (request.url === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// App listening at specific port
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

