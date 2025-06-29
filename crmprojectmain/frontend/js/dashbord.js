const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db'); // Ensure db.js exists in the same directory

// Load environment variables
dotenv.config({ path: './crm.env' });

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000; // Use environment variable or default to 5000

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static('frontend')); // Optional: Serves frontend files statically

// Example route
app.get('/', (req, res) => {
  res.send('Welcome to the CRM Backend!');
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/frontend/dashboard.html', (err) => {
    if (err) {
      res.status(404).send('Dashboard file not found');
    }
  });
});

// Database connection function
const initializeDB = async () => {
  try {
    await connectDB();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error.message);
    process.exit(1);
  }
};

// Start the server and initialize database
const startServer = async () => {
  await initializeDB(); // Connect to database first
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

startServer();