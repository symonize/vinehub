# WineHub CMS - Setup Guide

## Quick Start

Follow these steps to get your Wine CMS up and running:

### Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (v4.4 or higher)
3. **npm** or **yarn**

### Installation Steps

#### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

#### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/winehub

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

#### 3. Start MongoDB

Make sure MongoDB is running:

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or run manually
mongod --dbpath /path/to/your/data/directory
```

#### 4. Seed the Database

Create an admin user and sample data:

```bash
npm run seed
```

This will create:
- Admin user (email: admin@winehub.com, password: admin123)
- Sample winery with wines and vintages

#### 5. Start the Application

```bash
# Development mode (runs both backend and frontend)
npm run dev

# Or run separately:
# Backend only
npm run server

# Frontend only (in another terminal)
npm run client
```

#### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

### Default Login Credentials

```
Email: admin@winehub.com
Password: admin123
```

## Project Structure

```
WineHub CMS/
├── server/                 # Backend (Node.js + Express)
│   ├── config/            # Database configuration
│   ├── middleware/        # Auth, upload, error handling
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── index.js          # Server entry point
│   └── seed.js           # Database seeding script
│
├── client/               # Frontend (React)
│   ├── public/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context (Auth)
│   │   ├── pages/        # Page components
│   │   │   ├── wineries/
│   │   │   ├── wines/
│   │   │   └── vintages/
│   │   ├── utils/        # API utilities
│   │   ├── App.js        # Main app component
│   │   └── index.js      # React entry point
│   └── package.json
│
├── uploads/              # File storage (created automatically)
├── .env                  # Environment variables
├── .env.example          # Example env file
├── package.json          # Backend dependencies
└── README.md            # Documentation
```

## Features Implemented

### Backend (Complete)
✅ MongoDB schemas for Wineries, Wines, Vintages
✅ JWT authentication with role-based access control
✅ RESTful API endpoints for all resources
✅ File upload handling with Multer
✅ Input validation with express-validator
✅ Error handling middleware
✅ CORS and security headers

### Frontend (Partially Complete)
✅ Authentication system with protected routes
✅ Dashboard with statistics
✅ Winery management (List, Create, Edit, View, Delete)
✅ React Router navigation
✅ React Query for data fetching
✅ File upload UI components
✅ Responsive design

🚧 Wine management (Stub files created)
🚧 Vintage management (Stub files created)
🚧 Awards management UI
🚧 Gallery management for lifestyle images

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (Admin only)
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile
- `GET /api/auth/users` - Get all users (Admin only)

### Wineries
- `GET /api/wineries` - List all wineries
- `GET /api/wineries/:id` - Get single winery
- `POST /api/wineries` - Create winery (Admin, Editor)
- `PUT /api/wineries/:id` - Update winery (Admin, Editor)
- `DELETE /api/wineries/:id` - Delete winery (Admin)

### Wines
- `GET /api/wines` - List all wines
- `GET /api/wines/:id` - Get single wine
- `POST /api/wines` - Create wine (Admin, Editor)
- `PUT /api/wines/:id` - Update wine (Admin, Editor)
- `DELETE /api/wines/:id` - Delete wine (Admin, Editor)
- `POST /api/wines/:id/awards` - Add award to wine
- `DELETE /api/wines/:id/awards/:awardId` - Remove award

### Vintages
- `GET /api/vintages` - List all vintages
- `GET /api/vintages/:id` - Get single vintage
- `POST /api/vintages` - Create vintage (Admin, Editor)
- `PUT /api/vintages/:id` - Update vintage (Admin, Editor)
- `DELETE /api/vintages/:id` - Delete vintage (Admin, Editor)
- `PUT /api/vintages/:id/assets/:assetType` - Update asset
- `DELETE /api/vintages/:id/assets/:assetType` - Delete asset

### File Upload
- `POST /api/upload` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `DELETE /api/upload/:filename` - Delete file
- `GET /api/upload/:subdir/:filename` - Serve file

## Completing the Implementation

The core architecture is complete. To finish the Wine and Vintage pages:

### 1. Wine Pages
Copy the pattern from Winery pages:
- **WinesList.js**: Similar to WineriesList, add filters for type and region
- **WineForm.js**: Add fields for region, type, variety, tasting notes, food pairing
- **WineDetail.js**: Show wine info, awards list, and vintages

### 2. Vintage Pages
- **VintagesList.js**: List with wine relationships
- **VintageForm.js**: Form with wine selection dropdown and 5 asset upload fields
- **VintageDetail.js**: Display all assets with download links

### 3. Awards Management
Add inline awards management in WineDetail:
- Form to add new award (score, name, year)
- List of existing awards with delete button

## User Roles

### Admin
- Full access to all features
- Can create/edit/delete all content
- Can manage users

### Editor
- Can create/edit/delete own content
- Cannot delete others' content
- Cannot manage users

### Viewer
- Read-only access
- Cannot create, edit, or delete

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongo --eval "db.version()"`
- Check connection string in `.env`
- Verify MongoDB is listening on port 27017

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change PORT in .env file
```

### File Upload Not Working
- Check uploads directory exists and has write permissions
- Verify MAX_FILE_SIZE in .env
- Ensure file types are allowed (see upload.js middleware)

### CORS Issues
- Update CLIENT_URL in .env to match your frontend URL
- Check CORS configuration in server/index.js

## Next Steps

1. Complete Wine and Vintage page implementations
2. Add image galleries for winery lifestyle images
3. Implement search and advanced filtering
4. Add export functionality (CSV, PDF)
5. Implement GraphQL API (optional)
6. Add email notifications
7. Deploy to production

## Production Deployment

### Environment Variables
Update `.env` for production:
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure proper `MONGODB_URI`
- Set up cloud storage for uploads (optional)

### Build Frontend
```bash
cd client
npm run build
```

### Serve Static Files
Update server/index.js to serve built React app:
```javascript
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}
```

## Support

For issues or questions:
- Check the README.md
- Review API documentation
- Inspect browser console for frontend errors
- Check server logs for backend errors

## License

ISC
