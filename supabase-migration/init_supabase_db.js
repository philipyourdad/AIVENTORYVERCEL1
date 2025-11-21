/**
 * Script to initialize Supabase database with the refined schema
 * 
 * Usage:
 * 1. Update the environment variables in your .env file
 * 2. Run: node init_supabase_db.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Supabase connection
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read the refined schema file
const schemaPath = path.join(process.cwd(), 'refined_supabase_schema.sql');
let schemaSQL;

try {
  schemaSQL = fs.readFileSync(schemaPath, 'utf8');
} catch (err) {
  console.error('❌ Could not read schema file:', err.message);
  process.exit(1);
}

async function initializeDatabase() {
  console.log('🚀 Initializing Supabase database...');
  
  try {
    // Split the SQL into individual statements
    // Note: This is a simple split and may not work for complex SQL with semicolons in strings
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.startsWith('/*') || statement.length === 0) {
        continue;
      }
      
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        // For CREATE EXTENSION statements, we need to handle them differently
        if (statement.toUpperCase().includes('CREATE EXTENSION')) {
          console.log('Skipping extension creation (should be done in Supabase dashboard)');
          continue;
        }
        
        // Skip DROP TABLE statements in production
        if (statement.toUpperCase().includes('DROP TABLE') && process.env.NODE_ENV === 'production') {
          console.log('Skipping DROP TABLE in production environment');
          continue;
        }
        
        // Execute the statement
        const { error } = await supabase.rpc('execute_sql', { sql: statement });
        
        if (error) {
          console.warn(`⚠️  Warning executing statement ${i + 1}:`, error.message);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.warn(`⚠️  Error executing statement ${i + 1}:`, err.message);
        // Continue with other statements
      }
    }
    
    console.log('✅ Database initialization completed');
    
    // Test the connection by querying a sample table
    console.log('🧪 Testing database connection...');
    const { data, error } = await supabase.from('product').select('Product_id').limit(1);
    
    if (error) {
      console.error('❌ Test query failed:', error.message);
    } else {
      console.log('✅ Database connection test successful');
      console.log(`📊 Found ${data?.length || 0} products in the database`);
    }
    
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();