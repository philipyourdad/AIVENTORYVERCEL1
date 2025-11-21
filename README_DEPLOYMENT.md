# AIventory Cloud Deployment

This repository contains everything you need to deploy your AIventory application to the cloud with a working database.

## 🎯 Goal

Deploy your AIventory application so it's accessible from anywhere with:
- A cloud-hosted database (Supabase/PostgreSQL)
- A backend API (Railway)
- A frontend web application (Vercel)

## 📁 Repository Structure

```
├── supabase-migration/
│   └── 001_init_schema.sql     # PostgreSQL database schema
├── aiventory-web/
│   ├── server/
│   │   ├── index-postgresql.js      # PostgreSQL backend
│   │   └── package-postgresql.json  # PostgreSQL dependencies
│   └── ...                          # Frontend files
├── SUPABASE_SETUP.md           # Database setup guide
├── RAILWAY_DEPLOYMENT.md       # Backend deployment guide
├── DEPLOYMENT_GUIDE.md         # Complete deployment guide
├── DEPLOYMENT_README.md        # Quick overview
├── DEPLOYMENT_SUMMARY.md       # Deployment summary
├── deploy.sh                   # Deployment script (Linux/Mac)
└── deploy.bat                  # Deployment script (Windows)
```

## 🚀 Quick Start

1. **Create accounts** (all have free tiers):
   - [Supabase](https://supabase.com/) - Database
   - [Railway](https://railway.app/) - Backend hosting
   - [Vercel](https://vercel.com/) - Frontend hosting

2. **Set up the database**:
   ```bash
   # Follow SUPABASE_SETUP.md
   # Import schema from supabase-migration/001_init_schema.sql
   ```

3. **Deploy the backend**:
   ```bash
   # Replace backend files with PostgreSQL versions
   # Follow RAILWAY_DEPLOYMENT.md
   ```

4. **Deploy the frontend**:
   ```bash
   # Follow deployment instructions in DEPLOYMENT_GUIDE.md
   ```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [SUPABASE_SETUP.md](SUPABASE_SETUP.md) | Setting up your cloud database |
| [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) | Deploying your backend |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Complete deployment process |
| [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) | Deployment overview |

## 🛠️ Key Changes Made

### Database Migration
- Converted MySQL schema to PostgreSQL
- Updated data types and syntax for PostgreSQL compatibility

### Backend Updates
- Replaced MySQL driver with PostgreSQL driver (`pg`)
- Updated query syntax (`?` → `$1, $2, ...`)
- Updated result handling (`insertId` → `RETURNING *`)

### Deployment Configuration
- Created environment variable configurations
- Updated CORS settings for cross-domain requests
- Prepared for cloud deployment

## 🧪 Testing Your Deployment

After deployment, test:
1. Frontend loads correctly
2. Login works (admin/admin123)
3. Database connections work
4. API endpoints respond correctly
5. All application features function

## 🆘 Support

If you encounter issues:
1. Check logs in each service's dashboard
2. Verify environment variables are set correctly
3. Ensure database connection details are accurate
4. Confirm CORS settings allow your frontend domain

## 💰 Cost Considerations

All services used offer generous free tiers:
- **Supabase**: Free for small applications
- **Railway**: $5 monthly credit free
- **Vercel**: Free for hobby projects

## 🔒 Security Notes

- Never commit passwords or API keys to your repository
- Use environment variables for sensitive data
- Generate strong, random secrets for JWT tokens
- Regularly rotate your database passwords

## 📞 Getting Help

For issues with this deployment:
1. Review all documentation files
2. Check service-specific logs
3. Verify all environment variables
4. Ensure proper file replacements were made

The deployment should result in a fully functional AIventory application accessible from anywhere with a working cloud database.