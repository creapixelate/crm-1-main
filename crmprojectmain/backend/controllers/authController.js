const db = require('../config/db');
const otpUtil = require('../utils/otp');
const bcrypt = require('bcrypt');

// ------------------ LOGIN ------------------
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required.' });

  try {
    const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length === 0)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ success: false, message: 'Incorrect password.' });

    const otp = otpUtil.generateOTP();
    const time = new Date();
    await db.query('INSERT INTO otps (email, otp, create_time) VALUES (?, ?, ?)', [email, otp, time]);

    req.session.email = email; // Store email in session for verification and register lock
    console.log(`🔐 OTP for ${email} is ${otp}`);
    res.json({ success: true, message: 'OTP sent to your email.' });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ------------------ VERIFY OTP ------------------
exports.verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const email = req.session.email;

  if (!email || !otp)
    return res.status(400).json({ success: false, message: 'Email or OTP missing.' });

  try {
    const [results] = await db.query(
      'SELECT * FROM otps WHERE email = ? ORDER BY create_time DESC LIMIT 1',
      [email]
    );
    if (results.length === 0)
      return res.status(400).json({ success: false, message: 'No OTP found.' });

    const storedOtp = results[0].otp;

    if (storedOtp === otp) {
      await db.query('UPDATE users SET is_verified = 1 WHERE email = ?', [email]);
      return res.json({ success: true, message: 'OTP verified successfully.' });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid OTP.' });
    }

  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ------------------ REGISTER ------------------
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const sessionEmail = req.session.email;

  if (!sessionEmail)
    return res.status(403).json({ success: false, message: 'Please Sign In before Sign Up.' });

  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'All fields required.' });

  if (email !== sessionEmail)
    return res.status(403).json({ success: false, message: 'Email mismatch. Sign In email only allowed.' });

  try {
    const [exist] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (exist.length > 0)
      return res.status(409).json({ success: false, message: 'Email already registered.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (name, email, password, is_verified, create_time) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 1, new Date()]
    );

    res.json({ success: true, message: 'User registered successfully.' });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Database error.' });
  }
};

// ------------------ RESEND OTP ------------------
exports.resendOtp = async (req, res) => {
  const email = req.session.email;
  if (!email)
    return res.status(400).json({ success: false, message: 'Login required to resend OTP.' });

  try {
    const otp = otpUtil.generateOTP();
    await db.query('INSERT INTO otps (email, otp, create_time) VALUES (?, ?, ?)', [email, otp, new Date()]);
    console.log(`🔁 New OTP for ${email}: ${otp}`);
    res.json({ success: true, message: 'New OTP sent.' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ success: false, message: 'Could not resend OTP.' });
  }
};

// ------------------ SOCIAL LOGINS ------------------
exports.googleLogin = (req, res) => {
  res.send('Google login route');
};

exports.facebookLogin = (req, res) => {
  res.send('Facebook login route');
};
