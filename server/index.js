const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173',  // Adjust the origin to your frontend's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

 

// API route
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'API is running.' });
});

// Auth routes
const authRoutes = require('./routes/auth.js');
app.use('/auth', authRoutes);

 
// All other requests should return a 404 or handle accordingly
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
