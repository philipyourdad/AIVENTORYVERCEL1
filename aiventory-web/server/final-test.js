import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('Final database connection test...');
console.log('Database URL:', process.env.DATABASE_URL);

const { Pool } = pg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000, // 10 seconds
  idleTimeoutMillis: 30000, // 30 seconds
  max: 1 // Only one connection for testing
});

try {
  console.log('Testing database connection...');
  const res = await db.query('SELECT NOW()');
  console.log('✅ Database connection successful!');
  console.log('Current time:', res.rows[0].now);
  
  // Test a simple query
  const productRes = await db.query('SELECT COUNT(*) as count FROM product');
  console.log('Product count:', productRes.rows[0].count);
  
  await db.end();
  console.log('✅ All tests passed!');
} catch (err) {
  console.error('❌ Database connection failed:', err.message);
  console.error('Error code:', err.code);
  console.error('Error stack:', err.stack);
} finally {
  console.log('Test completed');
}