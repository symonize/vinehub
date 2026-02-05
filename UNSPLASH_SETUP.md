# Unsplash Integration Setup

This project includes integration with Unsplash to bulk add beautiful vineyard images to wineries.

## Getting Started

### 1. Get Unsplash API Key

1. Go to [Unsplash Developers](https://unsplash.com/developers)
2. Sign up or log in to your account
3. Click "Your apps" → "New Application"
4. Accept the API guidelines
5. Fill in the application details:
   - **Application name**: WineHub CMS
   - **Description**: Content management system for wine portfolio
6. Copy your **Access Key**

### 2. Add to Environment Variables

Add the Unsplash access key to your `.env` file:

```bash
UNSPLASH_ACCESS_KEY=your_access_key_here
```

For Railway deployment, add it to your environment variables in the Railway dashboard.

### 3. Using the Integration

#### Option 1: Via Script (Recommended for bulk operations)

Run the script from the project root:

```bash
# Add images to wineries that don't have featured images
node server/scripts/addWineryImages.js

# Replace all existing images (use with caution)
node server/scripts/addWineryImages.js --overwrite
```

#### Option 2: Via API Endpoint

Make a POST request to bulk add images:

```bash
curl -X POST \
  https://your-api-url.railway.app/api/wineries/bulk-add-images \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"overwrite": false}'
```

#### Option 3: Search Unsplash Images

Search for specific vineyard images:

```bash
curl -X GET \
  "https://your-api-url.railway.app/api/wineries/unsplash/search?query=vineyard&page=1&perPage=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Features

- **Automatic vineyard images**: Fetches beautiful vineyard and winery images
- **Rate limiting**: Built-in delays to respect Unsplash API limits
- **Fallback images**: Uses placeholder images if Unsplash API is unavailable
- **Attribution tracking**: Stores photographer credits for proper attribution
- **Selective update**: Only updates wineries without images (unless overwrite flag is used)

## Image Attribution

Images from Unsplash require attribution. The photographer's name and profile link are stored with each image. When displaying images on your public-facing site, ensure you credit photographers appropriately.

Example attribution:
```
Photo by [Photographer Name] on Unsplash
```

## API Rate Limits

Unsplash free tier includes:
- 50 requests per hour
- Demo applications can make up to 50 requests per hour

The script includes a 1-second delay between requests to stay within limits.

## Troubleshooting

### "UNSPLASH_ACCESS_KEY not configured"
- Check your `.env` file contains the access key
- For Railway: Check environment variables in dashboard
- Restart your server after adding the key

### Images not loading
- Verify the API key is valid
- Check Unsplash dashboard for rate limit status
- The script will use placeholder images if Unsplash is unavailable

### Rate limit exceeded
- Wait for your rate limit to reset (1 hour)
- Or upgrade to Unsplash+ for higher limits

## Without Unsplash API Key

The integration will still work without an API key by using placeholder vineyard images from Unsplash. However, you won't get random variety in images.

To use without API key:
1. Simply don't set `UNSPLASH_ACCESS_KEY` in `.env`
2. The system will automatically use fallback images
3. All wineries will get the same placeholder image
