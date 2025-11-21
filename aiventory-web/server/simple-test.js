import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing database connection with explicit parameters...');
console.log('Database URL:', process.env.DATABASE_URL);

// Parse the connection string to get individual components
const url = new URL(process.env.DATABASE_URL);
const config = {
  host: url.hostname,
  port: url.port,
  database: url.pathname.substring(1),
  user: url.username,
  password: url.password,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

console.log('Connection config:', {
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.user
});

const { Client } = pg;

const client = new Client(config);

try {
  console.log('Connecting to database...');
  await client.connect();
  console.log('✅ Connected successfully!');
  
  const res = await client.query('SELECT version()');
  console.log('Database version:', res.rows[0].version);
  
  await client.end();
  console.log('Connection closed');
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
      case '28000':
        console.error('Invalid authorization - check username/password');
        break;
      case '3D000':
        console.error('Invalid catalog name - check database name');
        break;
      default:
        console.error('Unknown error code:', err.code);
    }
  }
} finally {
  console.log('Test completed');
}