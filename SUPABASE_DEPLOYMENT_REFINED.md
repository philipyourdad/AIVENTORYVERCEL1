# Refined Supabase Database Deployment Guide

This guide will help you deploy your refined Supabase database schema with your AIventory application on both Vercel (frontend) and Railway (backend).

## Prerequisites

1. A Supabase account (free tier available at [supabase.com](https://supabase.com/))
2. A Vercel account (free tier available at [vercel.com](https://vercel.com/))
3. A Railway account (free tier available at [railway.app](https://railway.app/))

## Step 1: Set Up Your Refined Supabase Database

1. Log in to your Supabase account
2. Create a new project for AIventory
3. Once the project is created, go to the SQL Editor
4. Copy and paste the contents of `supabase-migration/refined_supabase_schema.sql` into the SQL Editor
5. Run the script to create your database tables and insert sample data

## Step 2: Update Environment Variables

After setting up your Supabase database, you'll need to update your environment variables in both your frontend and backend.

### Backend Environment Variables (Railway)

In your Railway project settings, add the following environment variables:

```
# Database Configuration for Supabase/PostgreSQL
DATABASE_URL=postgresql://postgres:YOUR_SUPABASE_PASSWORD@YOUR_SUPABASE_PROJECT.supabase.co:5432/postgres
SUPABASE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
VITE_SUPABASE_URL=https://YOUR_SUPABASE_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# JWT Secret - generate a strong random string
JWT_SECRET=YOUR_GENERATED_JWT_SECRET

# Server Port
PORT=8080

# Node Environment
NODE_ENV=production
```

### Frontend Environment Variables (Vercel)

In your Vercel project settings, add the following environment variables:

```
VITE_SUPABASE_URL=https://YOUR_SUPABASE_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## Step 3: Configure Supabase Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Disable "Enable email signup" as we're handling authentication through our custom backend
3. Set "Site URL" to your Vercel frontend URL (e.g., https://your-aiventory-frontend.vercel.app)

## Step 4: Update CORS Settings

In your Supabase dashboard:
1. Go to Settings > API
2. In the "Additional CORS Origins" section, add your Vercel frontend URL:
   - https://your-aiventory-frontend.vercel.app
   - http://localhost:5173 (for local development)

## Step 5: Deploy to Railway (Backend)

1. Go to [railway.app](https://railway.app/) and sign up or log in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account if prompted
5. Select your AIventory repository
6. Choose the `main` branch (or whatever branch you want to deploy)
7. Set the root directory to `aiventory-web/server`
8. Add the environment variables as specified in Step 2
9. Railway will automatically deploy your application

## Step 6: Deploy to Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com/) and sign up or log in
2. Click "New Project"
3. Import your GitHub repository
4. Set the root directory to `aiventory-web`
5. Set the build command to `npm run build`
6. Set the output directory to `dist`
7. Add the environment variables as specified in Step 2
8. Vercel will automatically deploy your application

## Key Improvements in the Refined Schema

1. **Fixed Data Types**: Corrected decimal field definitions to ensure proper precision
2. **Added Missing Triggers**: Added automatic timestamp update triggers for all relevant tables
3. **Consistent Field Names**: Ensured field names match between frontend and backend
4. **Improved Sample Data**: Added comprehensive sample data for testing
5. **Enhanced Error Handling**: Improved connection testing and error reporting

## Troubleshooting

### Database Connection Issues

1. Verify that all environment variables are correctly set
2. Check that your Supabase project URL and keys are correct
3. Ensure that CORS is properly configured in Supabase settings
4. Make sure your database connection string is properly formatted

### Authentication Issues

1. Verify that JWT_SECRET matches between your backend and environment variables
2. Check that the Supabase keys are correctly configured
3. Ensure that the authentication tables (admin, staff) have the correct structure

### Deployment Issues

1. Check the deployment logs in both Vercel and Railway
2. Verify that all dependencies are correctly installed
3. Ensure that the correct Node.js version is being used (should be 16+)

## Testing Your Deployment

1. Visit your Vercel frontend URL
2. Try logging in with the default admin account:
   - Username: admin
   - Password: admin123
3. Navigate through different sections to verify data is loading correctly
4. Try creating a new product or supplier to test write operations

## Security Considerations

1. Always use strong, randomly generated passwords
2. Rotate your Supabase keys periodically
3. Use environment variables for all sensitive information
4. Never commit sensitive information to version control
5. Consider implementing rate limiting for API endpoints
6. Regularly update dependencies to patch security vulnerabilities

## Maintenance

1. Regularly backup your Supabase database
2. Monitor your application logs for errors
3. Keep your dependencies up to date
4. Review and update your security settings periodically