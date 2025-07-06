const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Environment variables
dotenv.config();

// Firebase initialization
const { admin } = require('./config/firebase');

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Firebase connection test
const initializeFirebase = async () => {
  try {
    // Test Firebase connection
    console.log('Firebase initialized successfully');
    console.log('Project ID:', admin.app().options.projectId);
  } catch (error) {
    console.error('Firebase initialization error:', error);
    process.exit(1);
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'SAU Arsiv API is running!' });
});

// Auth routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await initializeFirebase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();