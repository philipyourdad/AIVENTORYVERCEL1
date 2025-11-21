import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Supabase connection...');
console.log('Supabase URL:', `https://${process.env.DATABASE_URL?.split('@')[1]?.split(':')[0]}`);
console.log('Supabase Key:', process.env.SUPABASE_KEY ? 'Key provided' : 'No key provided');

// Extract the Supabase URL from the DATABASE_URL
const supabaseUrl = `https://${process.env.DATABASE_URL?.split('@')[1]?.split(':')[0]}`;
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseKey) {
  console.error('❌ Supabase key is missing. Please add SUPABASE_KEY to your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

try {
  console.log('Attempting to connect to Supabase...');
  
  // Try a simple query to see if we can connect
  const { data, error, count } = await supabase
    .from('product')
    .select('*', { count: 'exact' });
  
  if (error) {
    console.error('❌ Supabase query failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Hint: This likely means the database schema is not imported yet');
    console.log('Please import the schema from supabase-migration/001_init_schema.sql');
  } else {
    console.log('✅ Connected to Supabase successfully!');
    console.log('Product count:', count);
    console.log('First product (if any):', data[0]);
  }
} catch (err) {
  console.error('❌ Connection failed:', err.message);
  console.error('Error stack:', err.stack);
} finally {
  console.log('Test completed');
}