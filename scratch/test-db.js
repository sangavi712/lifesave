import pool from '../backend/config/db.js';

async function test() {
  try {
    const res = await pool.query('SELECT * FROM users');
    console.log('Users found in db:', res.rows);
    process.exit(0);
  } catch (err) {
    console.error('Error querying users:', err);
    process.exit(1);
  }
}

test();
