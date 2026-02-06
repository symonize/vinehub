# WineHub Public Site

Consumer-facing marketing website for browsing wineries and wines.

## Features

- Browse wineries and their collections
- Explore wines with detailed information
- Filter by type, region, and search
- View vintages and awards
- Responsive design
- Connects to WineHub CMS backend API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The site will be available at http://localhost:3002

## Build

To build for production:
```bash
npm run build
```

## API Connection

The site connects to the WineHub CMS backend API running on port 5001.

Make sure the backend server is running before starting the public site.

## Environment

Create a `.env` file if you need to customize the API URL:

```
VITE_API_URL=http://localhost:5001/api
```
