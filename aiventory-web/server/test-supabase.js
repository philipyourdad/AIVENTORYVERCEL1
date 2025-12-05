import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in the main server
const supabaseUrl = 'https://fkapyzygvanrdjccgemj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrYXB5enlndmFucmRqY2NnZW1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDkyMDcsImV4cCI6MjA3OTIyNTIwN30.lvRFKy4SyLad8EB7eQ04oKb19wHmWFLmrk8AhPX4TSA';

console.log("Testing Supabase connection...");
console.log("URL:", supabaseUrl);
console.log("Key length:", supabaseKey.length);

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  },
  db: {
    ssl: false
  },
  global: {
    headers: {
      'apikey': supabaseKey
    }
  }
});

// Test connection
supabase.from('product').select('*').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error("❌ Supabase connection failed:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
    } else {
      console.log("✅ Connected to Supabase database");
      console.log("Test query successful, found", data?.length || 0, "products");
    }
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Supabase connection error:", err);
    process.exit(1);
  });