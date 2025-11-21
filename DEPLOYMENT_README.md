# AIventory Cloud Deployment

This repository contains all the files and instructions needed to deploy your AIventory application to the cloud with a working database.

## What's Included

1. **Database Migration**: PostgreSQL schema in [supabase-migration/001_init_schema.sql](supabase-migration/001_init_schema.sql)
2. **Supabase Setup Guide**: [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
3. **Railway Deployment Guide**: [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)
4. **Complete Deployment Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
5. **PostgreSQL Backend Files**:
   - [aiventory-web/server/index-postgresql.js](aiventory-web/server/index-postgresql.js)
   - [aiventory-web/server/package-postgresql.json](aiventory-web/server/package-postgresql.json)

## Deployment Overview

To deploy AIventory to the cloud, you'll need to:

1. Set up a Supabase database
2. Deploy the backend to Railway
3. Deploy the frontend to Vercel

## Quick Start

1. **Create accounts**:
   - [Supabase](https://supabase.com/)
   - [Railway](https://railway.app/)
   - [Vercel](https://vercel.com/)

2. **Set up the database**:
   - Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
   - Import the schema from [supabase-migration/001_init_schema.sql](supabase-migration/001_init_schema.sql)

3. **Deploy the backend**:
   - Use the PostgreSQL files in [aiventory-web/server/](aiventory-web/server/)
   - Follow [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)

4. **Deploy the frontend**:
   - Follow the Vercel deployment section in [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## Support

If you encounter any issues during deployment, please refer to the troubleshooting sections in each guide or open an issue in this repository.