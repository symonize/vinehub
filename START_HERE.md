# 🍷 START HERE - Quick Start Guide

## ✅ Setup Complete!

Your WineHub CMS is ready to run. The database has been seeded with:
- Admin user: **admin@winehub.com** / **admin123**
- Sample winery with wines and vintages

## 🚀 How to Start the Application

### Option 1: Use the Start Script (Recommended)

```bash
cd "/Users/simonmilberg/Desktop/WineHub CMS"
./start.sh
```

### Option 2: Manual Start

Open **TWO terminal windows**:

**Terminal 1 - Backend:**
```bash
cd "/Users/simonmilberg/Desktop/WineHub CMS"
npm run server
```

**Terminal 2 - Frontend:**
```bash
cd "/Users/simonmilberg/Desktop/WineHub CMS"
npm run client
```

### Option 3: One Command (Development Mode)

```bash
cd "/Users/simonmilberg/Desktop/WineHub CMS"
npm run dev
```

## 📱 Access the Application

After starting:
- **Frontend (Admin Panel):** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

## 🔐 Login Credentials

```
Email: admin@winehub.com
Password: admin123
```

## ⚠️ If Port 5000 is Busy

If you see `EADDRINUSE: address already in use :::5000`:

```bash
# Kill the process using port 5000
lsof -ti:5000 | xargs kill -9

# Then start again
npm run dev
```

## 🎯 What You Can Do Now

1. **Login** at http://localhost:3000/login
2. **View Dashboard** - See statistics and quick actions
3. **Manage Wineries** - Full CRUD operations
4. **View Sample Data** - Explore the seeded winery, wines, and vintages

## 📁 Project Structure

```
WineHub CMS/
├── server/           # Backend (Node.js + Express + MongoDB)
├── client/           # Frontend (React)
├── uploads/          # File storage
├── .env              # Configuration
├── start.sh          # Start script
└── TROUBLESHOOTING.md # Help guide
```

## 🆘 Having Issues?

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Make sure MongoDB is running: `brew services start mongodb-community`
3. Verify ports are free: `lsof -ti:5000` and `lsof -ti:3000`

## 📚 Next Steps

1. Explore the winery management interface
2. Complete the Wine and Vintage pages (follow Winery patterns)
3. Customize regions and wine types in the schemas
4. Add your own wineries and wines

## 🔧 Development Tips

- **Hot Reload**: Both frontend and backend support hot reloading
- **Database Reset**: Run `npm run seed` to reset database
- **API Testing**: Use http://localhost:5000/api/health to verify backend
- **Browser DevTools**: Press F12 to see console logs and network requests

## 📞 Need Help?

Common commands:
```bash
# Restart everything
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
npm run dev

# Reset database
npm run seed

# Check MongoDB
pgrep -x mongod

# Start MongoDB if not running
brew services start mongodb-community
```

---

**🎉 You're all set! Start the app and login to begin managing your wine inventory.**
