# Railway Deployment Guide for AIVentory Backend

This guide will help you deploy the AIVentory backend to Railway with the correct environment variables and database configuration.

## Prerequisites

1. A Railway account (free at [railway.app](https://railway.app))
2. A Supabase account with the database set up (see database setup guide)
3. Your Supabase database credentials

## Deployment Steps

### 1. Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub" or "Deploy from template"
4. Connect your AIVentory repository
5. Select the root directory as the project root (not aiventory-web)
6. Railway should automatically detect the Node.js project

### 2. Set Environment Variables

In your Railway project settings, go to the "Variables" section and add the following variables:

```
PORT=5001
SUPABASE_URL=https://fkapyzygvanrdjccgemj.supabase.co
SUPABASE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
CORS_ORIGIN=*
```

Replace `YOUR_SUPABASE_SERVICE_ROLE_KEY` with your actual Supabase service role key. You can find this in your Supabase project settings under "API" -> "Service Role Key".

### 3. Configure Database Connection

Make sure your Supabase database is accessible from Railway. The Supabase URL should work directly, but if you encounter connection issues:

1. Check that your Supabase project is not paused
2. Verify that your service role key is correct
3. Ensure that your database has the correct schema (see database setup guide)

### 4. Enable CORS for Vercel Frontend

To allow your Vercel frontend to communicate with the Railway backend, set the `CORS_ORIGIN` environment variable to your Vercel domain once you have it:

```
CORS_ORIGIN=https://your-aiventory-frontend.vercel.app
```

For development, you can use `*` to allow all origins, but this is not recommended for production.

### 5. Redeploy

After setting the environment variables, Railway should automatically redeploy your application. If not, click the "Redeploy" button.

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify that your `SUPABASE_URL` and `SUPABASE_KEY` are correct
2. Check that your Supabase project is not paused
3. Ensure that your database schema matches the expected structure
4. Check the Railway logs for specific error messages

### CORS Errors

If you see CORS errors in the browser console:

1. Make sure `CORS_ORIGIN` is set correctly in your Railway environment variables
2. For production, use your specific Vercel domain instead of `*`
3. Restart your Railway application after changing CORS settings

### Environment Variables Not Loading

If your environment variables don't seem to be loading:

1. Check that they are set in the Railway "Variables" section
2. Make sure there are no extra spaces or characters in the values
3. Restart your Railway application

## Verification

After deployment, you can verify that your backend is working correctly by:

1. Visiting your Railway application URL directly
2. Checking that the `/api/products` endpoint returns data
3. Verifying that there are no errors in the Railway logs

## Connecting to Vercel Frontend

Once your Railway backend is deployed:

1. Copy your Railway application URL (usually something like `https://your-app.up.railway.app`)
2. Set this as the `VITE_API_BASE` environment variable in your Vercel project
3. Redeploy your Vercel frontend

## Logs and Monitoring

You can view your application logs in the Railway dashboard:

1. Go to your Railway project
2. Click on your application
3. Select the "Logs" tab to view real-time logs

This will help you debug any issues that may arise during or after deployment.