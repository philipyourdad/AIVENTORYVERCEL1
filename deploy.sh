#!/bin/bash

# AIventory Deployment Script
# This script provides guidance for deploying AIventory to the cloud

echo "========================================"
echo "     AIventory Cloud Deployment"
echo "========================================"
echo ""
echo "This script will guide you through deploying AIventory to the cloud."
echo ""

# Check if required files exist
echo "Checking for required files..."
if [ -f "supabase-migration/001_init_schema.sql" ]; then
    echo "✅ Supabase migration file found"
else
    echo "❌ Supabase migration file not found"
    echo "   Please ensure you're running this script from the project root"
    exit 1
fi

if [ -f "SUPABASE_SETUP.md" ]; then
    echo "✅ Supabase setup guide found"
else
    echo "❌ Supabase setup guide not found"
fi

if [ -f "RAILWAY_DEPLOYMENT.md" ]; then
    echo "✅ Railway deployment guide found"
else
    echo "❌ Railway deployment guide not found"
fi

if [ -f "DEPLOYMENT_GUIDE.md" ]; then
    echo "✅ Complete deployment guide found"
else
    echo "❌ Complete deployment guide not found"
fi

echo ""
echo "========================================"
echo "           DEPLOYMENT STEPS"
echo "========================================"
echo ""
echo "1. SET UP SUPABASE DATABASE"
echo "   - Go to https://supabase.com/ and create an account"
echo "   - Create a new project named 'aiventory'"
echo "   - Follow the instructions in SUPABASE_SETUP.md"
echo "   - Import the schema from supabase-migration/001_init_schema.sql"
echo ""
echo "2. DEPLOY BACKEND TO RAILWAY"
echo "   - Go to https://railway.app/ and create an account"
echo "   - Connect your GitHub repository"
echo "   - Replace your backend files with the PostgreSQL versions:"
echo "     * aiventory-web/server/index.js → aiventory-web/server/index-postgresql.js"
echo "     * aiventory-web/server/package.json → aiventory-web/server/package-postgresql.json"
echo "   - Follow the instructions in RAILWAY_DEPLOYMENT.md"
echo "   - Set the required environment variables"
echo ""
echo "3. DEPLOY FRONTEND TO VERCEL"
echo "   - Go to https://vercel.com/ and create an account"
echo "   - Connect your GitHub repository"
echo "   - Set the root directory to 'aiventory-web'"
echo "   - Set the VITE_API_BASE environment variable to your Railway URL"
echo "   - Follow the instructions in DEPLOYMENT_GUIDE.md"
echo ""
echo "========================================"
echo "             DOCUMENTATION"
echo "========================================"
echo ""
echo "For detailed instructions, please read:"
echo "   - SUPABASE_SETUP.md"
echo "   - RAILWAY_DEPLOYMENT.md"
echo "   - DEPLOYMENT_GUIDE.md"
echo ""
echo "========================================"
echo "               NEXT STEPS"
echo "========================================"
echo ""
echo "After deployment, you should:"
echo "   1. Test the application by visiting your Vercel URL"
echo "   2. Log in with username 'admin' and password 'admin123'"
echo "   3. Verify all features work correctly"
echo "   4. Update the CORS settings in your backend to allow your Vercel domain"
echo ""
echo "For support, check the troubleshooting sections in each guide."
echo ""