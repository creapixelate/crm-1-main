const express = require('express');
const path = require('path');
const cors = require('cors');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const authRoutes = require('./routes/auth'); // ঠিকমত path

const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'creapixelate_secret_key',
  resave: false,
  saveUninitialized: true,
}));

app.use(express.static(path.join(__dirname, '../frontend')));

const csrfProtection = csrf({ cookie: true });

app.get('/auth/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.use('/api/auth', csrfProtection, authRoutes); // ঠিকঠাক এখানেও

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
