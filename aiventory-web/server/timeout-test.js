import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing database connection with timeout...');
console.log('Database URL:', process.env.DATABASE_URL);

// Parse the connection string to get individual components
const url = new URL(process.env.DATABASE_URL);
const config = {
  host: url.hostname,
  port: url.port,
  database: url.pathname.substring(1),
  user: url.username,
  password: url.password,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000, // 5 seconds timeout
};

console.log('Connection config:', {
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.user
});

const { Client } = pg;

const client = new Client(config);

// Set a timeout for the entire operation
const timeout = setTimeout(() => {
  console.log('❌ Connection timed out after 10 seconds');
  process.exit(1);
}, 10000);

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
} finally {
  clearTimeout(timeout);
  console.log('Test completed');
}