const db = require('../config/db'); // আপনার ডাটাবেজ config ফাইল
const bcrypt = require('bcrypt');

exports.login = (req, res) => {
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

    const passwordMatch = password === user.password; // আপনি bcrypt use করলে এখানে bcrypt.compare হবে

    if (!passwordMatch)
      return res.status(401).json({ success: false, message: 'Incorrect password.' });

    // OTP Generate logic এখানেই হবে
    req.session.email = email;

    res.json({ success: true, message: 'OTP sent.' });
  });
};
