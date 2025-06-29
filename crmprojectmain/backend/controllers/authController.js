const db = require('../config/db');
const otpUtil = require('../utils/otp'); // otp.js file must exist
const bcrypt = require('bcrypt');

// ------------------ LOGIN ------------------
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required.' });

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error.' });
    if (results.length === 0)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const user = results[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ success: false, message: 'Incorrect password.' });

    // Generate OTP
    const otp = otpUtil.generateOTP();
    const time = new Date();
    const insertQuery = 'INSERT INTO otps (email, otp, create_time) VALUES (?, ?, ?)';

    db.query(insertQuery, [email, otp, time], (err2) => {
      if (err2) return res.status(500).json({ success: false, message: 'Failed to store OTP.' });

      console.log(`🔐 OTP for ${email} is ${otp}`);
      req.session.email = email;
      res.json({ success: true, message: 'OTP sent to your email.' });
    });
  });
};

// ------------------ REGISTER ------------------
exports.register = (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'All fields required.' });

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ success: false, message: 'Error hashing password.' });

    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(query, [name, email, hashedPassword], (err2, result) => {
      if (err2) return res.status(500).json({ success: false, message: 'Database error.' });
      res.json({ success: true, message: 'User registered.' });
    });
  });
};

// ------------------ VERIFY OTP ------------------
exports.verifyOtp = (req, res) => {
  const { otp } = req.body;
  const email = req.session.email;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email or OTP missing.' });
  }

  const query = 'SELECT * FROM otps WHERE email = ? ORDER BY create_time DESC LIMIT 1';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error.' });
    if (results.length === 0) return res.status(400).json({ success: false, message: 'No OTP found.' });

    const storedOtp = results[0].otp;

    if (storedOtp === otp) {
      return res.json({ success: true, message: 'OTP verified successfully.' });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid OTP.' });
    }
  });
};

// ------------------ SOCIAL LOGINS ------------------
exports.googleLogin = (req, res) => {
  res.send('Google login route');
};
exports.facebookLogin = (req, res) => {
  res.send('Facebook login route');
};
