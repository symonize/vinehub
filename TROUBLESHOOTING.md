# Troubleshooting Guide

## Quick Fix - Run This First!

```bash
# Kill any process on port 5000
lsof -ti:5000 | xargs kill -9

# Seed the database
npm run seed

# Start the app
npm run dev
```

## Common Issues & Solutions

### 1. Port 5000 Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find and kill the process
lsof -ti:5000 | xargs kill -9

# Or change the port in .env
# Edit .env and change PORT=5000 to PORT=5001
```

### 2. MongoDB Not Running

**Error:** `MongoServerError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**
```bash
# Start MongoDB
brew services start mongodb-community

# Or run manually
mongod --dbpath ~/data/db
```

### 3. Dependencies Not Installed

**Error:** `Cannot find module 'express'` or similar

**Solution:**
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 4. No Admin User / Can't Login

**Solution:**
```bash
# Re-seed the database
npm run seed

# This creates:
# Email: admin@winehub.com
# Password: admin123
```

### 5. React App Won't Start

**Error:** Port 3000 is already in use

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or the app will prompt you to use a different port
```

### 6. CORS Errors in Browser

**Error:** `Access to fetch has been blocked by CORS policy`

**Solution:**
Check that CLIENT_URL in `.env` matches your frontend URL:
```env
CLIENT_URL=http://localhost:3000
```

### 7. File Upload Not Working

**Error:** Cannot upload images

**Solution:**
```bash
# Create uploads directory with proper permissions
mkdir -p uploads/images uploads/documents uploads/others
chmod -R 755 uploads
```

## Step-by-Step Fresh Start

If nothing works, try this complete reset:

```bash
# 1. Navigate to project
cd "/Users/simonmilberg/Desktop/WineHub CMS"

# 2. Kill any running processes
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# 3. Remove node_modules and reinstall
rm -rf node_modules client/node_modules
npm install
cd client && npm install && cd ..

# 4. Make sure MongoDB is running
brew services start mongodb-community

# 5. Seed the database
npm run seed

# 6. Start the app
npm run dev
```

## Use the Start Script

The easiest way to start the app:

```bash
# First time (with database seeding)
./start.sh --seed

# Regular startup
./start.sh
```

## Check Logs

### Backend Logs
The backend terminal will show:
- MongoDB connection status
- Server port
- API requests

### Frontend Logs
The frontend terminal will show:
- Webpack compilation status
- Any React errors

### Browser Console
Press F12 in Chrome/Firefox to see:
- Network errors
- API response errors
- JavaScript errors

## Verify Setup

Run these commands to check everything:

```bash
# Check MongoDB
pgrep -x mongod && echo "✅ MongoDB running" || echo "❌ MongoDB not running"

# Check if backend dependencies installed
test -d node_modules && echo "✅ Backend deps installed" || echo "❌ Backend deps missing"

# Check if frontend dependencies installed
test -d client/node_modules && echo "✅ Frontend deps installed" || echo "❌ Frontend deps missing"

# Check ports
lsof -ti:5000 && echo "⚠️  Port 5000 in use" || echo "✅ Port 5000 free"
lsof -ti:3000 && echo "⚠️  Port 3000 in use" || echo "✅ Port 3000 free"
```

## Still Having Issues?

1. Check the error message carefully
2. Look at both terminal windows (backend and frontend)
3. Check the browser console (F12)
4. Verify all files exist (especially in server/ and client/src/)
5. Make sure .env file exists with correct values

## Manual Testing

Test the backend API directly:

```bash
# Test server health
curl http://localhost:5000/api/health

# Test login (after seeding)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@winehub.com","password":"admin123"}'
```

## Environment Check

Your `.env` should look like this:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/winehub
JWT_SECRET=winehub-secret-key-2024-change-in-production
JWT_EXPIRE=7d
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
CLIENT_URL=http://localhost:3000
```

## Contact

If you're still stuck, provide:
1. The exact error message
2. Which step failed
3. Output of: `node --version` and `npm --version`
4. Output of: `pgrep mongod`
