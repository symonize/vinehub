const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const axios = require('axios');
const FormData = require('form-data');
const { protect } = require('../middleware/auth');
const Wine = require('../models/Wine');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// @route   POST /api/ai/generate-wine-image
// @desc    Generate wine bottle image using DALL-E 3
// @access  Private
router.post('/generate-wine-image', protect, async (req, res) => {
  try {
    const { wineId, wineName, wineType, variety, region, wineryName } = req.body;

    if (!wineName || !wineType) {
      return res.status(400).json({
        success: false,
        message: 'Wine name and type are required'
      });
    }

    // Create a detailed prompt for DALL-E 3
    const prompt = `Professional product photography of a ${wineType} wine bottle isolated on transparent background.
The bottle is elegant and premium, with a ${wineType === 'red' ? 'dark bordeaux' : wineType === 'white' ? 'light champagne' : wineType === 'rosé' ? 'pink' : 'dark'} glass bottle.
${wineryName ? `The label shows "${wineryName}" as the winery name.` : ''}
The label features "${wineName}" prominently displayed.
${variety ? `It's a ${variety} wine.` : ''}
${region ? `From ${region}.` : ''}
PNG with transparent background, no background elements, studio lighting on the bottle only, centered composition,
photorealistic, professional product shot, sharp focus on the label details, cutout style.`;

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

        // Convert the image buffer to base64 data URL
        const base64Image = Buffer.from(bgRemovalResponse.data, 'binary').toString('base64');
        imageUrl = `data:image/png;base64,${base64Image}`;

        console.log('Background removed successfully');
      } catch (bgError) {
        console.error('Background removal failed:', bgError.response?.data?.errors || bgError.message);
        console.log('Using original image without background removal');
      }
    } else {
      console.log('REMOVEBG_API_KEY not configured, skipping background removal');
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
