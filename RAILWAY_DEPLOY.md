# Deploy to Railway - 100% FREE ($5 credit/month)

## Railway Deployment Steps

### Step 1: Deploy on Railway
1. Go to https://railway.app
2. Click "Login" and sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `vinehub` repository
6. Railway will auto-detect your Node.js app

### Step 2: Add Environment Variables
Click on your service, then go to "Variables" tab:

```
MONGODB_URI=mongodb+srv://simon_db_user:Zu7rQps3ASdqA5cw@winehub.qrodiu7.mongodb.net/winehub?appName=WineHub
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
CLIENT_URL=https://your-app.vercel.app
```

### Step 3: Deploy Frontend to Vercel (FREE)
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Import your `vinehub` repository
5. Configure project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-railway-app.up.railway.app
   ```
7. Click "Deploy"

### Step 4: Update URLs
After both are deployed:

**Update Railway (Backend):**
- Go to your Railway project → Variables
- Update `CLIENT_URL` to your Vercel URL (e.g., `https://vinehub.vercel.app`)

**Update Vercel (Frontend):**
- Go to your Vercel project → Settings → Environment Variables
- Update `REACT_APP_API_URL` to your Railway URL (e.g., `https://vinehub-production.up.railway.app`)
- Redeploy (click "Deployments" → three dots → "Redeploy")

---

## Alternative: Deploy Everything to Vercel

You can also deploy the full-stack app to Vercel using serverless functions:

1. Keep backend as API routes
2. Deploy frontend normally
3. Use Vercel's serverless functions for API

This requires more configuration but is 100% free with no credit limits.

---

## Railway Free Tier Details

- $5 credit/month (renews monthly)
- No credit card required initially
- Unused credit doesn't roll over
- Typical usage: $3-4/month for small apps
- If you exceed $5, service stops (won't charge you)

---

## Vercel Free Tier Details

- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Global CDN
- Perfect for React frontends
- Completely free forever

---

## Cost Comparison

| Platform | Free Tier | Best For |
|----------|-----------|----------|
| Railway | $5 credit/month | Backend API |
| Vercel | Unlimited | Frontend React |
| Fly.io | 3 VMs free | Full-stack |
| Render | Paid ($7/mo) | Not free anymore |

---

## Recommendation

**Best Free Setup:**
1. Backend → Railway ($5 credit covers it)
2. Frontend → Vercel (completely free)
3. Database → MongoDB Atlas (free 512MB)

This gives you a professional, fast, free hosting setup!

---

## Next Steps

1. Deploy backend to Railway
2. Deploy frontend to Vercel
3. Update environment variables
4. Test your live site!

Need help? Let me know which platform you want to use!
