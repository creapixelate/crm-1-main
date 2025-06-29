const express = require('express');
const path = require('path');
const cors = require('cors');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const authRoutes = require('./routes/auth');
require('dotenv').config(); // for .env support

const app = express();
const PORT = process.env.PORT || 5000; // 🟢 PORT for Render

// 🟡 Allow CORS from frontend domain
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'creapixelate_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// 🟢 Serve static HTML files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

const csrfProtection = csrf({ cookie: true });

// ✅ CSRF token route
app.get('/auth/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ✅ Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// ✅ Auth routes
app.use('/api/auth', csrfProtection, authRoutes);

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
