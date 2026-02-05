# WineHub CMS

A custom content management system for managing wine inventory and digital assets, inspired by Directus architecture.

## Features

- **Winery Management**: Complete winery profiles with images, logos, and galleries
- **Wine Catalog**: Detailed wine information with regions, types, and tasting notes
- **Vintage Tracking**: Multiple vintages per wine with vintage-specific assets
- **Awards System**: Track wine awards with scores, names, and years
- **Asset Management**: Organize bottle images, tech sheets, shelf talkers, tasting cards, and labels
- **REST API**: Complete API for external applications
- **Role-Based Access**: Admin, Editor, and Viewer roles
- **File Upload**: Local filesystem storage for all assets

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: React, React Router, Axios
- **Authentication**: JWT-based authentication
- **File Handling**: Multer for multipart uploads

## Data Model

### Wineries
- Name, Description
- Featured Image, Logo
- Lifestyle Images Gallery
- Related Wines

### Wines
- Name, Description
- Region (dropdown), Type (red/white/sparkling)
- Tasting Notes, Variety, Food Pairing
- Parent Winery
- Multiple Vintages
- Multiple Awards

### Vintages
- Year
- Parent Wine
- Assets (bottle image, tech sheet, shelf talker, tasting card, label)

### Awards
- Score (0-100)
- Award Name
- Year
- Parent Wine

## Installation

1. Clone the repository
2. Copy `.env.example` to `.env` and configure
3. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   ```
4. Start MongoDB
5. Run the application:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Wineries
- `GET /api/wineries` - List all wineries
- `GET /api/wineries/:id` - Get single winery
- `POST /api/wineries` - Create winery
- `PUT /api/wineries/:id` - Update winery
- `DELETE /api/wineries/:id` - Delete winery

### Wines
- `GET /api/wines` - List all wines
- `GET /api/wines/:id` - Get single wine
- `POST /api/wines` - Create wine
- `PUT /api/wines/:id` - Update wine
- `DELETE /api/wines/:id` - Delete wine

### Vintages
- `GET /api/vintages` - List all vintages
- `GET /api/vintages/:id` - Get single vintage
- `POST /api/vintages` - Create vintage
- `PUT /api/vintages/:id` - Update vintage
- `DELETE /api/vintages/:id` - Delete vintage

### File Upload
- `POST /api/upload` - Upload file

## Development

- Frontend runs on `http://localhost:3000`
- Backend API runs on `http://localhost:5000`

## License

ISC
