# Supabase Migration Scripts

This directory contains the refined Supabase database schema and initialization scripts for AIventory.

## Files

- `001_init_schema.sql` - Original initialization schema
- `aiventory-supabase.sql` - Converted MySQL schema
- `refined_supabase_schema.sql` - Refined schema with fixes for Vercel and Railway deployment
- `init_supabase_db.js` - Node.js script to initialize the database
- `package.json` - Dependencies for the initialization script

## Using the Refined Schema

### Option 1: Manual SQL Execution

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `refined_supabase_schema.sql`
4. Run the script

### Option 2: Using the Initialization Script

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-service-role-key
   ```

3. Run the initialization script:
   ```bash
   npm run init-db
   ```

## Key Improvements in the Refined Schema

1. **Fixed Data Types**: Corrected decimal field definitions for proper precision
2. **Added Missing Triggers**: Automatic timestamp update triggers for relevant tables
3. **Improved Sample Data**: Comprehensive sample data for testing
4. **Enhanced Error Handling**: Better connection testing and error reporting

## Deployment Guides

For complete deployment instructions with Vercel and Railway, see:
- `SUPABASE_DEPLOYMENT_REFINED.md` in the root directory