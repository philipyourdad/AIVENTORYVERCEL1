# Deploying AIventory Backend to Railway

This guide will help you deploy your AIventory backend to Railway, a cloud platform for hosting applications.

## Prerequisites

1. A Railway account (free tier available at [railway.app](https://railway.app/))
2. A GitHub account
3. Your Supabase database set up and connection details ready

## Step 1: Prepare Your Backend for Railway

First, we need to make some modifications to your backend to work with PostgreSQL and Railway.

### 1. Update Database Dependencies

Update your `aiventory-web/server/package.json` to use PostgreSQL instead of MySQL:

```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "bcrypt": "^6.0.0",
    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3"
  }
}
```

### 2. Update Database Connection Code

Update your `aiventory-web/server/index.js` file to use PostgreSQL:

```javascript
// Replace the MySQL connection section with PostgreSQL
import pg from "pg";

// PostgreSQL connection
const { Pool } = pg;
const db = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:password@localhost:5432/postgres",
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test DB connection
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
  } else {
    console.log("✅ Connected to PostgreSQL database");
  }
});
```

Note: You'll need to update all your database queries to work with PostgreSQL syntax. The main differences are:
- Use `RETURNING *` instead of `result.insertId` for getting inserted IDs
- Some functions may have different names
- Parameter placeholders use `$1, $2, $3...` instead of `?`

## Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app/) and sign up or log in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account if prompted
5. Select your AIventory repository
6. Choose the `main` branch (or whatever branch you want to deploy)
7. Set the root directory to `aiventory-web/server`

## Step 3: Configure Environment Variables

In Railway, go to your project settings and add the following environment variables:

```
DB_HOST=your-supabase-host.supabase.co
DB_USER=postgres
DB_PASSWORD=your-supabase-password
DB_NAME=postgres
DB_PORT=5432
DATABASE_URL=postgresql://postgres:your-supabase-password@your-supabase-host.supabase.co:5432/postgres
JWT_SECRET=your-jwt-secret-key (generate a random string)
PORT=5001
NODE_ENV=production
```

## Step 4: Update Database Queries

You'll need to update all database queries in your backend to work with PostgreSQL. Here are some examples:

### Before (MySQL):
```javascript
db.query("INSERT INTO product (Product_name, Product_sku) VALUES (?, ?)", [name, sku], (err, result) => {
  const newProductId = result.insertId;
  // ...
});
```

### After (PostgreSQL):
```javascript
db.query("INSERT INTO product (Product_name, Product_sku) VALUES ($1, $2) RETURNING Product_id", [name, sku], (err, result) => {
  const newProductId = result.rows[0].Product_id;
  // ...
});
```

## Step 5: Deploy

1. After setting up the environment variables, Railway will automatically deploy your application
2. Wait for the deployment to complete
3. Note the URL provided by Railway (something like `your-app.railway.app`)

## Step 6: Update CORS Settings

Update the CORS settings in your `aiventory-web/server/index.js` to allow your Vercel frontend:

```javascript
app.use(cors({
  origin: [
    'https://your-aiventory-frontend.vercel.app',  // Your Vercel URL (to be set up later)
    'http://localhost:5173',  // Keep for local development
    'http://localhost:5001'   // Keep for local development
  ],
  credentials: true
}));
```

## Railway Advantages

- Easy deployment from GitHub
- Automatic SSL certificates
- Custom domains
- Environment variable management
- Logs and monitoring
- Free tier available (good for development and small applications)

## Troubleshooting

- If your application fails to start, check the logs in Railway
- Make sure all environment variables are correctly set
- Ensure your database connection details are correct
- Verify that your database queries are compatible with PostgreSQL