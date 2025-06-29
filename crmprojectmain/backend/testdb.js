const pool = require('./config/db');

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Database connected successfully!");
    conn.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
}

testConnection();
