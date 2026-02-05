# 🍷 WineHub CMS - READY TO RUN!

## ✅ All Fixed! Port Issue Resolved

**Problem:** Port 5000 was occupied by macOS Control Center
**Solution:** Backend now runs on **port 5001** instead

---

## 🚀 START THE APP NOW

```bash
cd "/Users/simonmilberg/Desktop/WineHub CMS"
npm run dev
```

**Wait for both servers to start (about 30 seconds), then:**

1. Open browser: **http://localhost:3000**
2. Login with:
   - Email: **admin@winehub.com**
   - Password: **admin123**

---

## 🌐 URLs

- **Frontend:** http://localhost:3000 (Admin Panel)
- **Backend API:** http://localhost:5001/api
- **Health Check:** http://localhost:5001/api/health

---

## ⚡ What Was Fixed

1. ✅ Removed deprecated MongoDB options (no more warnings)
2. ✅ Changed PORT from 5000 → 5001 (avoiding macOS conflict)
3. ✅ Database seeded with sample data
4. ✅ Updated all client files to use correct API URL
5. ✅ Created centralized API configuration

---

## 📋 What's Working

- ✅ Backend API (all endpoints tested)
- ✅ Authentication & JWT tokens
- ✅ MongoDB connection
- ✅ User roles (Admin, Editor, Viewer)
- ✅ Winery management (full CRUD)
- ✅ File upload system
- ✅ Sample data loaded

---

## 🎯 Try This First

1. Start the app: `npm run dev`
2. Login at http://localhost:3000
3. Click "Wineries" in the sidebar
4. View the sample "Napa Valley Estates" winery
5. Try editing it or creating a new one

---

## 🆘 If Something Goes Wrong

### Backend won't start?
```bash
lsof -ti:5001 | xargs kill -9
npm run server
```

### Frontend won't start?
```bash
lsof -ti:3000 | xargs kill -9
cd client && npm start
```

### Can't login?
```bash
npm run seed  # Resets database & creates admin user
```

### MongoDB not running?
```bash
brew services start mongodb-community
```

---

## 📁 Project Status

### Fully Complete
- ✅ Backend API & Database
- ✅ Authentication System
- ✅ Winery Pages (List, Form, Detail)
- ✅ File Upload & Storage
- ✅ Admin Layout & Navigation
- ✅ Dashboard

### Placeholder Files (To Complete)
- 🚧 Wine Pages (follow Winery pattern)
- 🚧 Vintage Pages (follow Winery pattern)

---

## 📚 Documentation Files

- **QUICK_START.txt** - Quick reference guide
- **START_HERE.md** - Detailed setup guide
- **SETUP.md** - Complete documentation
- **TROUBLESHOOTING.md** - Problem solving
- **README.md** - API endpoints & features

---

## 🎓 API Examples

Test the backend directly:

```bash
# Health check
curl http://localhost:5001/api/health

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@winehub.com","password":"admin123"}'

# Get wineries (after getting token)
curl http://localhost:5001/api/wineries \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔧 Quick Commands

```bash
# Start everything
npm run dev

# Start backend only
npm run server

# Start frontend only
npm run client

# Reset database
npm run seed

# Kill all processes
lsof -ti:5001 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

---

## ✨ You're All Set!

Everything is configured and ready. Just run:

```bash
npm run dev
```

Then open http://localhost:3000 and login!

---

**Questions?** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or [SETUP.md](SETUP.md)

**Ready?** Run `npm run dev` and start managing your wine inventory! 🍷
