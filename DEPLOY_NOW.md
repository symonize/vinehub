# Deploy WineHub CMS to Render - Quick Start

## Your MongoDB Connection String
```
mongodb+srv://simon_db_user:<db_password>@winehub.qrodiu7.mongodb.net/?appName=WineHub
```

**IMPORTANT:** Replace `<db_password>` with your actual MongoDB password before using!

Add the database name at the end:
```
mongodb+srv://simon_db_user:YOUR_PASSWORD@winehub.qrodiu7.mongodb.net/winehub?appName=WineHub
```

---

## Deployment Steps

### Step 1: Set Up GitHub Repository (if not already done)
```bash
# Initialize git if needed
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Render deployment"

# Create a new repository on GitHub, then:
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

### Step 2: Configure MongoDB Atlas Access
1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Click on your cluster "WineHub"
3. Go to "Network Access" → "Add IP Address"
4. Click "Allow Access from Anywhere" (for Render servers)
5. Confirm (this allows IP: `0.0.0.0/0`)

### Step 3: Deploy on Render
1. Go to https://render.com and sign in with GitHub
2. Click "New +" → "Blueprint"
3. Click "Connect Account" to authorize GitHub access
4. Select your `WineHub CMS` repository
5. Render will detect the `render.yaml` file
6. Click "Approve" to review the services

### Step 4: Set Environment Variables
Render will prompt you to set these variables:

**For Backend Service (winehub-cms-api):**
- `MONGODB_URI`: `mongodb+srv://simon_db_user:YOUR_ACTUAL_PASSWORD@winehub.qrodiu7.mongodb.net/winehub?appName=WineHub`
- `JWT_SECRET`: Will auto-generate (or use your own secure random string)
- `CLIENT_URL`: Leave blank for now (update after frontend deploys)

**For Frontend Service (winehub-cms-client):**
- `REACT_APP_API_URL`: Leave blank for now (update after backend deploys)

### Step 5: Apply and Deploy
1. Click "Apply" to start deployment
2. Wait for both services to deploy (5-10 minutes)
3. You'll get URLs like:
   - Backend: `https://winehub-cms-api.onrender.com`
   - Frontend: `https://winehub-cms-client.onrender.com`

### Step 6: Update Cross-References
1. Go to backend service settings → Environment
2. Update `CLIENT_URL` to: `https://winehub-cms-client.onrender.com`
3. Go to frontend service settings → Environment
4. Add `REACT_APP_API_URL` to: `https://winehub-cms-api.onrender.com`
5. Both services will auto-redeploy with new settings

---

## Verify Deployment

### Test Backend
Visit: `https://winehub-cms-api.onrender.com/api/health` (or your health check endpoint)

### Test Frontend
Visit: `https://winehub-cms-client.onrender.com`

---

## Important Notes

### Free Tier Limitations
- Services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- 750 hours/month of runtime per service (plenty for 1 service)

### File Uploads
- Render's free tier uses ephemeral storage
- Uploaded files will be lost when the service restarts
- **Solution**: Integrate Cloudinary for persistent file storage
  - Free tier: 25 GB storage
  - I can help set this up after deployment

### Keep Your Site Awake (Optional)
Use a free monitoring service to ping your site every 15 minutes:
- UptimeRobot (free): https://uptimerobot.com
- Cron-job.org (free): https://cron-job.org

---

## Troubleshooting

### "Cannot connect to MongoDB"
- Check MongoDB Atlas Network Access allows `0.0.0.0/0`
- Verify password has no special characters that need URL encoding
- Check connection string format is correct

### "CORS Error" in Browser
- Verify `CLIENT_URL` in backend matches frontend URL exactly
- Check CORS configuration in server code

### Build Fails
- Check build logs in Render dashboard
- Verify all dependencies are in package.json
- Ensure Node.js version compatibility

---

## After Successful Deployment

1. ✅ Test login functionality
2. ✅ Test creating/editing wines
3. ✅ Test file uploads (remember they're temporary)
4. 🔧 Set up Cloudinary for persistent storage
5. 🔧 Configure custom domain (optional)
6. 🔧 Set up automated backups

---

## Need Help?

If you encounter issues:
1. Check Render logs in the dashboard
2. Verify environment variables are set correctly
3. Test MongoDB connection string locally first
4. Check MongoDB Atlas network access settings

Ready to deploy? Start with Step 1!
