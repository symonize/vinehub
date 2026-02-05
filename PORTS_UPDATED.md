# 🔧 Ports Have Been Updated

## ✅ Configuration Changed

Both port 3000 and 5000 were occupied, so the app now uses:

- **Backend API:** Port **5001** ✅ (Already running!)
- **Frontend:** Port **3001** ✅ (Updated)

---

## 🚀 RESTART THE APP

Press `Ctrl+C` in your terminal to stop the current process, then run:

```bash
npm run dev
```

---

## 🌐 Access the App

**Frontend:** http://localhost:3001
**Backend API:** http://localhost:5001

**Login:**
- Email: admin@winehub.com
- Password: admin123

---

## 📝 What Changed

1. Backend moved from port 5000 → 5001 (macOS Control Center conflict)
2. Frontend moved from port 3000 → 3001 (another app was using 3000)
3. CORS updated to allow port 3001

---

## ✨ Next Steps

1. Stop the current process (Ctrl+C)
2. Run: `npm run dev`
3. Wait about 30 seconds for both servers to start
4. Open: http://localhost:3001
5. Login and explore!

---

The backend is already running successfully! Just restart to get the frontend on the new port.
