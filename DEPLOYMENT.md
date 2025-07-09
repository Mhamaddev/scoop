# 🚀 Vercel Deployment Guide for AccountingPro

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Node.js 18+**: For local development

## 🎯 Deployment Options

### Option A: Quick Deploy (SQLite - Demo/Testing)
✅ **Pros**: Easy setup, no external dependencies  
⚠️ **Cons**: Data resets on each deployment, not suitable for production

### Option B: Production Deploy (External Database)
✅ **Pros**: Persistent data, production-ready  
⚠️ **Cons**: Requires database setup

---

## 🚀 Option A: Quick Deploy with SQLite

### Step 1: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com) and sign in**
2. **Click "New Project"**
3. **Import your GitHub repository** (`Mhamaddev/scoop`)
4. **Configure the project**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 2: Environment Variables (Optional)
Add in Vercel Dashboard → Settings → Environment Variables:
```
NODE_ENV=production
```

### Step 3: Deploy
Click **"Deploy"** - Your app will be live in 2-3 minutes!

**⚠️ Note**: Database will reset on each deployment. Good for demos only.

---

## 🏢 Option B: Production Deploy with Persistent Database

### Step 1: Choose a Database Provider

#### **Recommended: Vercel Postgres**
1. **In Vercel Dashboard** → Storage → Create Database
2. **Select Postgres** → Follow setup wizard
3. **Copy connection details**

#### **Alternative: Supabase**
1. **Go to [supabase.com](https://supabase.com)**
2. **Create new project**
3. **Get connection string from Settings → Database**

### Step 2: Install Database Dependencies
```bash
npm install pg @types/pg
npm remove sqlite3  # Remove SQLite dependency
```

### Step 3: Update Database Configuration

Create `api/database-postgres.js`:
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Promisified query functions
const runQuery = async (query, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return { rowCount: result.rowCount, rows: result.rows };
  } finally {
    client.release();
  }
};

const getQuery = async (query, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows[0];
  } finally {
    client.release();
  }
};

const allQuery = async (query, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
};

module.exports = { runQuery, getQuery, allQuery, pool };
```

### Step 4: Update API Routes
Replace SQLite imports in all `/api/routes/*.js` files:
```javascript
// Replace this:
const { runQuery, getQuery, allQuery } = require('../database');

// With this:
const { runQuery, getQuery, allQuery } = require('../database-postgres');
```

### Step 5: Environment Variables in Vercel
Add in Vercel Dashboard → Settings → Environment Variables:
```
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
```

### Step 6: Deploy
Deploy to Vercel - your app will have persistent data!

---

## 🔧 Quick Deployment (Option A)

If you want to deploy quickly with SQLite for testing:

```bash
# 1. Commit your changes
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main

# 2. Go to vercel.com, import your GitHub repo, and deploy!
```

---

## 🌐 Live URLs

After deployment, you'll get URLs like:
- **Frontend**: `https://your-app-name.vercel.app`
- **API**: `https://your-app-name.vercel.app/api/*`

---

## 🐛 Troubleshooting

### Common Issues:

1. **API Routes not working**:
   - Check `vercel.json` configuration
   - Ensure `/api/` folder structure is correct

2. **Database errors**:
   - Verify environment variables
   - Check database connection string

3. **Build failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Debug Steps:

1. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard → Functions → View logs

2. **Test API Endpoints**:
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

3. **Check Browser Console**:
   - Open DevTools → Console for frontend errors

---

## 📞 Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Issues**: Create issue in your repository
- **Check Function Logs**: Vercel Dashboard → Functions

---

🎉 **Ready to Deploy!** Choose your option and follow the steps above. 