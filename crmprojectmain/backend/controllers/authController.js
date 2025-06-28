const db = require('../config/db');
const bcrypt = require('bcrypt');

// ------------------ LOGIN ------------------
const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required.' });

  const query = 'SELECT * FROM users WHERE email = ?';

  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }

    if (results.length === 0)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const user = results[0];
    const passwordMatch = password === user.password;

    if (!passwordMatch)
      return res.status(401).json({ success: false, message: 'Incorrect password.' });

    req.session.email = email;
    res.json({ success: true, message: 'OTP sent.' });
  });
};

// ------------------ REGISTER ------------------
const register = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'All fields required.' });

  const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';

  db.query(query, [name, email, password], (err, result) => {
    if (err) {
      console.error('Registration DB error:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }

    res.json({ success: true, message: 'User registered.' });
  });
};

// ------------------ VERIFY OTP ------------------
const verifyOtp = (req, res) => {
  const { otp } = req.body;
  // Add OTP logic here later
  res.json({ success: true, message: 'OTP verified successfully.' });
};

// ------------------ GOOGLE LOGIN ------------------
const googleLogin = (req, res) => {
  res.send('Google login route');
};

// ------------------ FACEBOOK LOGIN ------------------
const facebookLogin = (req, res) => {
  res.send('Facebook login route');
};

// ✅ Export properly
module.exports = {
  login,
  register,
  verifyOtp,
  googleLogin,
  facebookLogin
};
