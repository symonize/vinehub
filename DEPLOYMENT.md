# Deployment Guide - WineHub CMS

## Option 1: Render (Recommended - Easiest)

### Prerequisites
1. GitHub account
2. Render account (free): https://render.com
3. MongoDB Atlas account (free): https://www.mongodb.com/cloud/atlas

### Step 1: Set Up MongoDB Atlas (Free)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (M0 Sandbox - Free forever)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/winehub`)
6. Replace `<password>` with your database password
7. Add your database name at the end (e.g., `/winehub`)

### Step 2: Push Code to GitHub
```bash
# If not already a git repo with remote
git init
git add .
git commit -m "Initial commit for deployment"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin master
```

### Step 3: Deploy on Render
1. Go to https://render.com and sign in
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will detect the `render.yaml` file
5. Set environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `CLIENT_URL`: Will be auto-generated, update after frontend deploys
6. Click "Apply" to deploy both services

### Step 4: Update Environment Variables
1. After deployment, get the frontend URL (e.g., `https://winehub-cms-client.onrender.com`)
2. Go to backend service settings
3. Update `CLIENT_URL` to match the frontend URL
4. Get the backend URL (e.g., `https://winehub-cms-api.onrender.com`)
5. Go to frontend service settings
6. Add `REACT_APP_API_URL` environment variable with backend URL

### Step 5: Update Client API Configuration
Update [client/src/config/api.js](client/src/config/api.js) or wherever API base URL is configured:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

---

## Option 2: Vercel (Frontend) + Railway (Backend)

### Railway Backend Setup
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add MongoDB plugin (free tier available)
6. Set environment variables in Railway dashboard
7. Deploy

### Vercel Frontend Setup
1. Go to https://vercel.com
2. Import your GitHub repository
3. Set root directory to `client`
4. Add environment variable: `REACT_APP_API_URL` = your Railway backend URL
5. Deploy

---

## Option 3: Fly.io (Full Stack)

### Prerequisites
- Install Fly CLI: `brew install flyctl` (macOS)
- Sign up: `fly auth signup`

### Deploy Backend
```bash
fly launch --name winehub-cms-api
fly secrets set MONGODB_URI="your-mongodb-uri"
fly secrets set JWT_SECRET="your-secret"
fly secrets set CLIENT_URL="your-frontend-url"
fly deploy
```

### Deploy Frontend
```bash
cd client
fly launch --name winehub-cms-client
fly deploy
```

---

## Important Notes

### Database Considerations
- **MongoDB Atlas Free Tier**: 512 MB storage, perfect for starting
- Consider seeding your database with initial data after deployment

### File Uploads
- Free hosting typically uses ephemeral storage (files disappear on restart)
- For persistent storage, integrate:
  - **Cloudinary** (free tier: 25 GB)
  - **AWS S3** (free tier: 5 GB for 12 months)
  - **Uploadcare** (free tier: 3 GB)

### Performance
- Free tiers may "sleep" after inactivity (30 mins on Render)
- First request after sleep takes 30-60 seconds to wake up
- Consider using a monitoring service to keep it awake

### CORS Configuration
Make sure [server/index.js](server/index.js) has proper CORS setup:
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
```

---

## Troubleshooting

### Backend won't connect to MongoDB
- Check MongoDB Atlas IP whitelist (allow all IPs: `0.0.0.0/0` for testing)
- Verify connection string format
- Check database user permissions

### Frontend can't reach backend
- Verify `REACT_APP_API_URL` is set correctly
- Check CORS configuration
- Ensure backend is running and accessible

### Build failures
- Check Node.js version compatibility
- Verify all dependencies are in `package.json` (not devDependencies for production needs)
- Check build logs for specific errors

---

## Cost Breakdown (Free Tiers)

| Service | Free Tier Limits |
|---------|-----------------|
| Render | 750 hrs/month web service |
| Railway | $5 credit/month (expires) |
| Vercel | 100 GB bandwidth |
| MongoDB Atlas | 512 MB storage |
| Cloudinary | 25 GB storage, 25 GB bandwidth |

---

## Next Steps After Deployment

1. Test all functionality on live site
2. Set up custom domain (optional, supported by all platforms)
3. Configure file upload to cloud storage
4. Set up monitoring/analytics
5. Enable HTTPS (automatic on most platforms)
6. Set up automated backups for MongoDB
