const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db');


dotenv.config({ path: './crm.env' });

const app = express();
const port = process.env.PORT || 5000; 

// Middleware to parse JSON bodies
app.use(express.json());


app.use(express.static('frontend')); 

app.get('/', (req, res) => {
  res.send('Welcome to the CRM Backend!');
});

app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/frontend/dashboard.html', (err) => {
    if (err) {
      res.status(404).send('Dashboard file not found');
    }
  });
});


const initializeDB = async () => {
  try {
    await connectDB();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error.message);
    process.exit(1);
  }
};


const startServer = async () => {
  await initializeDB();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

startServer();