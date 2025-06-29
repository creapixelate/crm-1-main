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

    console.log(`🔐 OTP for ${email} is ${otp}`);
    req.session.email = email;
    res.json({ success: true, message: 'OTP sent to your email.' });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
