const axios = require('axios');

/**
 * Unsplash API utilities for fetching vineyard images
 * Get your API key at: https://unsplash.com/developers
 */

const UNSPLASH_API_URL = 'https://api.unsplash.com';
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

/**
 * Search for vineyard images on Unsplash
 * @param {string} query - Search query (default: 'vineyard')
 * @param {number} perPage - Number of results per page
 * @param {number} page - Page number
 * @returns {Promise<Array>} Array of image objects
 */
async function searchVineyardImages(query = 'vineyard', perPage = 30, page = 1) {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('UNSPLASH_ACCESS_KEY not configured - using placeholder images');
    return generatePlaceholderImages(perPage);
  }

  try {
    const response = await axios.get(`${UNSPLASH_API_URL}/search/photos`, {
      params: {
        query,
        per_page: perPage,
        page,
        orientation: 'landscape'
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });

    return response.data.results.map(photo => ({
      id: photo.id,
      url: photo.urls.regular,
      downloadUrl: photo.urls.full,
      thumbUrl: photo.urls.thumb,
      description: photo.description || photo.alt_description,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      width: photo.width,
      height: photo.height
    }));
  } catch (error) {
    console.error('Error fetching from Unsplash:', error.message);
    return generatePlaceholderImages(perPage);
  }
}

/**
 * Get a random vineyard image from Unsplash
 * @param {string} query - Search query
 * @returns {Promise<Object>} Image object
 */
async function getRandomVineyardImage(query = 'vineyard,winery') {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('UNSPLASH_ACCESS_KEY not configured - using placeholder image');
    return generatePlaceholderImages(1)[0];
  }

  try {
    const response = await axios.get(`${UNSPLASH_API_URL}/photos/random`, {
      params: {
        query,
        orientation: 'landscape'
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });

    const photo = response.data;
    return {
      id: photo.id,
      url: photo.urls.regular,
      downloadUrl: photo.urls.full,
      thumbUrl: photo.urls.thumb,
      description: photo.description || photo.alt_description,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      width: photo.width,
      height: photo.height
    };
  } catch (error) {
    console.error('Error fetching random image from Unsplash:', error.message);
    return generatePlaceholderImages(1)[0];
  }
}

/**
 * Generate placeholder images when Unsplash is not available
 * @param {number} count - Number of placeholders to generate
 * @returns {Array} Array of placeholder image objects
 */
function generatePlaceholderImages(count = 1) {
  const placeholders = [];
  for (let i = 0; i < count; i++) {
    const seed = Math.random().toString(36).substring(7);
    placeholders.push({
      id: `placeholder-${seed}`,
      url: `https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&h=800&fit=crop`,
      downloadUrl: `https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1920&h=1280&fit=crop`,
      thumbUrl: `https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=267&fit=crop`,
      description: 'Beautiful vineyard landscape',
      photographer: 'Unsplash',
      photographerUrl: 'https://unsplash.com',
      width: 1200,
      height: 800
    });
  }
  return placeholders;
}

module.exports = {
  searchVineyardImages,
  getRandomVineyardImage,
  generatePlaceholderImages
};
