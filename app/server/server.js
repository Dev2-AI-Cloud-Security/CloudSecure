// index.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const { mysqlConnection, connectMongoDB } = require('./db');
const authController = require('./controllers/authController');
const { chatBot } = require('./controllers/chatController'); // ✅ NEW: chatbot controller

const app = express();
const port = process.env.PORT || 3001;

// CORS Configuration
const corsOptions = {
  origin: true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 3600,
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable pre-flight requests for all routes
app.options('*', cors(corsOptions));

// Add headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Connect to databases
connectMongoDB()
  .then(() => {
    console.log('✅ Connected to MongoDB');

    // Test MySQL connection
    mysqlConnection.connect((err) => {
      if (err) {
        console.error('❌ MySQL Connection Error:', err);
        return;
      }
      console.log('✅ Connected to MySQL');
    });
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.post('/register', authController.registerUser);
app.post('/login', authController.loginUser);
app.post('/chat', chatBot); // ✅ NEW: OpenAI chatbot route

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
