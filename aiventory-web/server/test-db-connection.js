import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing database connection...');
console.log('Database URL:', process.env.DATABASE_URL);

const { Pool } = pg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000, // 10 seconds
  idleTimeoutMillis: 30000, // 30 seconds
  max: 1 // Only one connection for testing
});

try {
  console.log('Attempting to connect...');
  const client = await db.connect();
  console.log('✅ Connected successfully!');
  
  const res = await client.query('SELECT NOW()');
  console.log('Current time from database:', res.rows[0].now);
  
  client.release();
} catch (err) {
  console.error('❌ Connection failed:', err.message);
  console.error('Error code:', err.code);
  console.error('Error stack:', err.stack);
  
  // Additional error details
  if (err.code) {
    switch (err.code) {
      case 'ECONNREFUSED':
        console.error('Connection refused - check if the database server is running');
        break;
      case 'ENOTFOUND':
        console.error('Host not found - check the database URL');
        break;
      case 'ER_ACCESS_DENIED_ERROR':
        console.error('Access denied - check username/password');
        break;
      default:
        console.error('Unknown error code:', err.code);
    }
  }
} finally {
  await db.end();
  console.log('Test completed');
}