# Vercel Deployment Guide for AIVentory Web

This guide will help you deploy the AIVentory web frontend to Vercel with the correct environment variables.

## Prerequisites

1. A Vercel account (free at [vercel.com](https://vercel.com))
2. The AIVentory backend deployed to Railway (see backend deployment guide)
3. Your Railway backend URL

## Deployment Steps

### 1. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your AIVentory repository or upload the code
4. In the project settings, configure the following:
   - Framework Preset: Vite
   - Root Directory: aiventory-web
   - Build Command: `npm run build`
   - Output Directory: dist

### 2. Set Environment Variables

In your Vercel project settings, go to the "Environment Variables" section and add the following variables:

```
VITE_API_BASE=https://your-railway-backend-url.up.railway.app
VITE_SUPABASE_URL=https://fkapyzygvanrdjccgemj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrYXB5enlndmFucmRqY2NnZW1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDkyMDcsImV4cCI6MjA3OTIyNTIwN30.lvRFKy4SyLad8EB7eQ04oKb19wHmWFLmrk8AhPX4TSA
```

Replace `https://your-railway-backend-url.up.railway.app` with your actual Railway backend URL.

### 3. Redeploy

After setting the environment variables, trigger a new deployment by pushing a small change to your repository or using the "Redeploy" button in Vercel.

## Troubleshooting

### TypeError: Cannot read properties of undefined (reading 'toLowerCase')

If you encounter this error:

1. Make sure your environment variables are correctly set in Vercel
2. Check that your Railway backend is running and accessible
3. Verify that your Supabase database has the correct data structure
4. Ensure that the API responses from your backend match the expected format in the frontend code

### API Connection Issues

If the frontend can't connect to the backend:

1. Check that your Railway backend URL is correct in the Vercel environment variables
2. Make sure your Railway backend has CORS enabled for your Vercel domain
3. Verify that your backend is running and accessible

## Environment Variable Files

The project includes the following environment files:

- `.env`: Used for local development
- `.env.production`: Template for production environment variables

When deploying to Vercel, you should set the environment variables in the Vercel dashboard rather than relying on these files.