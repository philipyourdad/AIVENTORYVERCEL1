# Complete Deployment Guide for AIventory

This guide will walk you through deploying your AIventory application to the cloud with a working database.

## Overview

We'll be deploying:
1. **Frontend**: To Vercel (React/Vite application)
2. **Backend**: To Railway (Node.js/Express API)
3. **Database**: To Supabase (PostgreSQL)

## Prerequisites

1. Accounts:
   - [Vercel](https://vercel.com/)
   - [Railway](https://railway.app/)
   - [Supabase](https://supabase.com/)
   - GitHub account

2. Tools installed:
   - Git
   - Node.js (v16 or higher)
   - npm or yarn

## Step 1: Set Up Supabase Database

Follow the instructions in [SUPABASE_SETUP.md](SUPABASE_SETUP.md) to:
1. Create a Supabase project
2. Get your database connection details
3. Import the database schema

## Step 2: Update Backend for PostgreSQL

Before deploying to Railway, you need to update your backend to work with PostgreSQL:

1. Update `aiventory-web/server/package.json` to include the `pg` dependency:
   ```json
   "dependencies": {
     // ... existing dependencies
     "pg": "^8.11.3"
   }
   ```

2. Update database connection in `aiventory-web/server/index.js`:
   ```javascript
   // Replace MySQL imports with PostgreSQL
   import pg from "pg";
   
   // Replace MySQL connection with PostgreSQL
   const { Pool } = pg;
   const db = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
   });
   ```

3. Update all database queries to use PostgreSQL syntax:
   - Change `?` placeholders to `$1, $2, $3...`
   - Use `RETURNING *` to get inserted IDs
   - Update any MySQL-specific functions

## Step 3: Deploy Backend to Railway

Follow the instructions in [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) to:
1. Create a Railway project
2. Connect your GitHub repository
3. Set environment variables
4. Deploy your backend

Make sure to set these environment variables in Railway:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST].supabase.co:5432/postgres
JWT_SECRET=[GENERATE_A_RANDOM_STRING]
PORT=5001
NODE_ENV=production
```

Note the Railway URL after deployment (e.g., `your-app.railway.app`).

## Step 4: Update Frontend API Configuration

Update your frontend to use the Railway backend URL:

1. Create a `.env.production` file in `aiventory-web/`:
   ```
   VITE_API_BASE=https://your-app.railway.app
   ```

2. Or set this as an environment variable in Vercel later.

## Step 5: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com/) and sign up or log in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Vite
   - Root Directory: `aiventory-web`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables:
   - `VITE_API_BASE` = `https://your-app.railway.app` (your Railway URL)
6. Click "Deploy"

## Step 6: Update Backend CORS Settings

Update the CORS settings in your backend to allow your Vercel frontend:

```javascript
app.use(cors({
  origin: [
    'https://your-aiventory.vercel.app',  // Your Vercel deployment URL
    'http://localhost:5173'               // Keep for local development
  ],
  credentials: true
}));
```

Redeploy your backend to Railway after making this change.

## Step 7: Test Your Deployment

1. Visit your Vercel URL
2. Try logging in with:
   - Username: `admin`
   - Password: `admin123`
3. Test various features to ensure everything works

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Make sure your backend CORS settings include your Vercel URL
   - Redeploy your backend after CORS changes

2. **Database Connection Errors**:
   - Verify all database environment variables are correct
   - Check that your Supabase database allows connections from Railway

3. **API Not Found Errors**:
   - Ensure your `VITE_API_BASE` environment variable is set correctly in Vercel
   - Check that your backend is running on Railway

4. **Login Failures**:
   - Verify the sample admin user was created in your Supabase database
   - Check backend logs for authentication errors

### Checking Logs

- **Vercel**: Go to your project dashboard and click "Logs"
- **Railway**: Go to your project dashboard and click "Logs"
- **Supabase**: Go to "SQL Editor" and run queries to check data

## Updating Your Application

### Frontend Updates

1. Push changes to your GitHub repository
2. Vercel will automatically redeploy

### Backend Updates

1. Push changes to your GitHub repository
2. Railway will automatically redeploy

### Database Updates

1. Make schema changes in Supabase SQL Editor
2. Update your backend code to work with new schema
3. Redeploy backend to Railway

## Cost Considerations

1. **Vercel**: Free tier is sufficient for development and small applications
2. **Railway**: Free tier includes $5 credit monthly
3. **Supabase**: Free tier is generous for development and small applications

All services offer paid tiers for production applications with higher usage.

## Security Considerations

1. Never commit sensitive information like passwords or API keys to your repository
2. Always use environment variables for sensitive data
3. Generate strong, random secrets for JWT
4. Regularly rotate your database passwords
5. Use HTTPS (automatically provided by Vercel and Railway)

## Next Steps

1. Set up custom domains for your frontend and backend
2. Add monitoring and error tracking
3. Implement CI/CD pipelines
4. Add automated testing
5. Set up database backups