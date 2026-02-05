const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Winery = require('../models/Winery');
const Wine = require('../models/Wine');
const { protect, authorize } = require('../middleware/auth');
const { getRandomVineyardImage, searchVineyardImages } = require('../utils/unsplash');

// @route   GET /api/wineries
// @desc    Get all wineries
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const wineries = await Winery.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Winery.countDocuments(query);

    res.json({
      success: true,
      count: wineries.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: wineries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/wineries/:id
// @desc    Get single winery
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const winery = await Winery.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate({
        path: 'wines',
        match: { status: 'published' }
      });

    if (!winery) {
      return res.status(404).json({
        success: false,
        message: 'Winery not found'
      });
    }

    res.json({
      success: true,
      data: winery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/wineries
// @desc    Create new winery
// @access  Private (Admin, Editor)
router.post('/', [
  protect,
  authorize('admin', 'editor'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const wineryData = {
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    const winery = await Winery.create(wineryData);

    res.status(201).json({
      success: true,
      data: winery
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Winery with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/wineries/:id
// @desc    Update winery
// @access  Private (Admin, Editor)
router.put('/:id', [
  protect,
  authorize('admin', 'editor')
], async (req, res) => {
  try {
    let winery = await Winery.findById(req.params.id);

    if (!winery) {
      return res.status(404).json({
        success: false,
        message: 'Winery not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && winery.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this winery'
      });
    }

    winery = await Winery.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: winery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/wineries/:id
// @desc    Delete winery
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const winery = await Winery.findById(req.params.id);

    if (!winery) {
      return res.status(404).json({
        success: false,
        message: 'Winery not found'
      });
    }

    // Check if winery has wines
    const wineCount = await Wine.countDocuments({ winery: req.params.id });
    if (wineCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete winery. It has ${wineCount} associated wines. Please delete wines first.`
      });
    }

    await winery.deleteOne();

    res.json({
      success: true,
      message: 'Winery deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/wineries/bulk-add-images
// @desc    Bulk add featured images to wineries from Unsplash
// @access  Private (Admin only)
router.post('/bulk-add-images', protect, authorize('admin'), async (req, res) => {
  try {
    const { overwrite = false } = req.body;

    // Get all wineries without featured images or all if overwrite is true
    const query = overwrite ? {} : { 'featuredImage.path': { $exists: false } };
    const wineries = await Winery.find(query);

    if (wineries.length === 0) {
      return res.json({
        success: true,
        message: 'All wineries already have featured images',
        count: 0,
        data: []
      });
    }

    const updated = [];
    const errors = [];

    for (const winery of wineries) {
      try {
        const image = await getRandomVineyardImage('vineyard,winery,wine estate');

        winery.featuredImage = {
          filename: `${image.id}.jpg`,
          path: image.url,
          mimetype: 'image/jpeg',
          size: 0,
          uploadedAt: new Date()
        };

        await winery.save();
        updated.push({
          wineryId: winery._id,
          wineryName: winery.name,
          imageUrl: image.url,
          photographer: image.photographer
        });
      } catch (error) {
        errors.push({
          wineryId: winery._id,
          wineryName: winery.name,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Successfully added images to ${updated.length} wineries`,
      count: updated.length,
      data: updated,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/wineries/unsplash/search
// @desc    Search Unsplash for vineyard images
// @access  Private (Admin, Editor)
router.get('/unsplash/search', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { query = 'vineyard', page = 1, perPage = 20 } = req.query;
    const images = await searchVineyardImages(query, parseInt(perPage), parseInt(page));

    res.json({
      success: true,
      count: images.length,
      data: images
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
