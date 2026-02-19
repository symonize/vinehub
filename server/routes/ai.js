const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');
const { protect } = require('../middleware/auth');
const Wine = require('../models/Wine');

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  console.log('OpenAI initialized successfully');
} else {
  console.warn('OPENAI_API_KEY not configured - AI features will be disabled');
}

// @route   POST /api/ai/generate-wine-image
// @desc    Generate wine bottle image using DALL-E 3
// @access  Private
router.post('/generate-wine-image', protect, async (req, res) => {
  try {
    // Check if OpenAI is configured
    if (!openai) {
      return res.status(503).json({
        success: false,
        message: 'AI image generation is not configured. Please contact administrator.'
      });
    }

    const { wineId, wineName, wineType, variety, region, wineryName } = req.body;

    if (!wineName || !wineType) {
      return res.status(400).json({
        success: false,
        message: 'Wine name and type are required'
      });
    }

    // Create a detailed prompt for DALL-E 3
    // Note: DALL-E 3 doesn't support transparent backgrounds natively,
    // so we generate on a clean white background for easier removal
    const prompt = `Professional product photography of a ${wineType} wine bottle isolated on pure white background.
The bottle is elegant and premium, with a ${wineType === 'red' ? 'dark bordeaux' : wineType === 'white' ? 'light champagne' : wineType === 'rosé' ? 'pink' : 'dark'} glass bottle.
${wineryName ? `The label shows "${wineryName}" as the winery name.` : ''}
The label features "${wineName}" prominently displayed.
${variety ? `It's a ${variety} wine.` : ''}
${region ? `From ${region}.` : ''}
Clean white background, no shadows, studio lighting on the bottle only, centered composition,
photorealistic, professional product shot, sharp focus on the label details, cutout style, product photography.`;

    console.log('Generating image with prompt:', prompt);

    // Generate image using DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    });

    let imageUrl = response.data[0].url;

    // Remove background if API key is available
    if (process.env.REMOVEBG_API_KEY) {
      try {
        console.log('Removing background from generated image...');

        const formData = new FormData();
        formData.append('image_url', imageUrl);
        formData.append('size', 'auto');
        formData.append('format', 'png');

        const bgRemovalResponse = await axios({
          method: 'post',
          url: 'https://api.remove.bg/v1.0/removebg',
          data: formData,
          responseType: 'arraybuffer',
          headers: {
            ...formData.getHeaders(),
            'X-Api-Key': process.env.REMOVEBG_API_KEY,
          },
          encoding: null
        });

        console.log('Background removed successfully');

        // Process and crop the image
        console.log('Processing image: cropping and centering...');
        const imageBuffer = Buffer.from(bgRemovalResponse.data, 'binary');

        // Process with sharp: trim whitespace, resize to standard size, and center
        const processedBuffer = await sharp(imageBuffer)
          .trim({ threshold: 10 }) // Remove transparent edges
          .resize(800, 1200, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toBuffer();

        // Convert processed image to base64
        const base64Image = processedBuffer.toString('base64');
        imageUrl = `data:image/png;base64,${base64Image}`;

        console.log('Image processed and cropped successfully');
      } catch (bgError) {
        console.error('Background removal failed:', bgError.response?.data?.errors || bgError.message);
        console.log('Using original image without background removal');
      }
    } else {
      console.log('REMOVEBG_API_KEY not configured - images will be generated on white background');
      console.log('To enable automatic background removal, add REMOVEBG_API_KEY to your .env file');
      console.log('Get an API key at: https://www.remove.bg/api');
    }

    // If wineId is provided, update the wine document
    if (wineId) {
      await Wine.findByIdAndUpdate(wineId, {
        bottleImage: {
          url: imageUrl,
          generatedAt: new Date(),
          prompt: prompt
        },
        updatedBy: req.user.id
      });
    }

    res.json({
      success: true,
      data: {
        imageUrl,
        prompt: response.data[0].revised_prompt || prompt
      }
    });

  } catch (error) {
    console.error('Image generation error:', error);

    let message = 'Failed to generate image';
    if (error.response?.data?.error?.message) {
      message = error.response.data.error.message;
    } else if (error.message) {
      message = error.message;
    }

    res.status(500).json({
      success: false,
      message,
      error: error.message
    });
  }
});

// @route   POST /api/ai/upload-wine-image/:wineId
// @desc    Upload wine bottle image manually
// @access  Private
router.post('/upload-wine-image/:wineId', protect, async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    const wine = await Wine.findById(req.params.wineId);

    if (!wine) {
      return res.status(404).json({
        success: false,
        message: 'Wine not found'
      });
    }

    wine.bottleImage = {
      url: imageUrl,
      generatedAt: new Date(),
      prompt: 'Manually uploaded'
    };
    wine.updatedBy = req.user.id;
    await wine.save();

    res.json({
      success: true,
      data: {
        imageUrl
      }
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/ai/wine-image/:wineId
// @desc    Remove wine bottle image
// @access  Private
router.delete('/wine-image/:wineId', protect, async (req, res) => {
  try {
    const wine = await Wine.findById(req.params.wineId);

    if (!wine) {
      return res.status(404).json({
        success: false,
        message: 'Wine not found'
      });
    }

    wine.bottleImage = undefined;
    wine.updatedBy = req.user.id;
    await wine.save();

    res.json({
      success: true,
      message: 'Image removed successfully'
    });

  } catch (error) {
    console.error('Error removing image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
