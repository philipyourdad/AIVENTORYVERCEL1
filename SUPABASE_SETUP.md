# Supabase Setup for AIventory

This guide will help you set up Supabase as your cloud database for AIventory.

## Prerequisites

1. A Supabase account (free tier available at [supabase.com](https://supabase.com/))
2. Basic understanding of SQL

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com/) and sign up or log in
2. Click "New Project"
3. Enter project details:
   - Name: `aiventory`
   - Database password: Choose a strong password and save it
   - Region: Select the region closest to you
4. Click "Create New Project"
5. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your Database Connection Details

1. Once your project is ready, go to the Project Dashboard
2. In the left sidebar, click on "Project Settings" (gear icon)
3. Click on "Database"
4. Note down the following information:
   - Project URL (API URL)
   - Project API Key (anon or service_role key)
   - Database connection string (contains host, port, database name)

## Step 3: Connect to Your Supabase Database

You can connect using various tools:

### Option A: Using Supabase SQL Editor (Easiest)

1. In your Supabase project dashboard, click on "SQL Editor" in the left sidebar
2. Copy the content of `supabase-migration/001_init_schema.sql` and paste it into the SQL editor
3. Click "Run" to execute the script

### Option B: Using psql or any PostgreSQL client

1. Install a PostgreSQL client if you don't have one
2. Use the connection string from Supabase to connect:
   ```bash
   psql postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
3. Run the SQL script:
   ```bash
   \i supabase-migration/001_init_schema.sql
   ```

## Step 4: Update Your Backend Configuration

After setting up the database, you'll need to update your backend to use Supabase instead of your local MySQL database.

In your `aiventory-web/server/.env` file, update the database connection details:
```
DB_HOST=your-project-ref.supabase.co
DB_USER=postgres
DB_PASSWORD=your-database-password
DB_NAME=postgres
DB_PORT=5432
```

Note: You'll also need to update your backend code to use PostgreSQL instead of MySQL. This requires changing the database driver from `mysql2` to `pg` and updating some SQL syntax.

## Supabase Advantages

- Fully managed PostgreSQL database
- Built-in authentication
- Real-time subscriptions
- Automatic backups
- Scalable infrastructure
- Free tier available (good for development and small applications)

## Troubleshooting

- If you get connection errors, make sure your database password is correct
- Ensure your IP is not blocked by Supabase's network restrictions
- Check that you're using the correct connection string format