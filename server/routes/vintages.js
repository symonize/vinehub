const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Vintage = require('../models/Vintage');
const Wine = require('../models/Wine');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/vintages
// @desc    Get all vintages
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { wine, year, status, page = 1, limit = 10 } = req.query;

    let query = {};

    // Filter by wine
    if (wine) {
      query.wine = wine;
    }

    // Filter by year
    if (year) {
      query.year = year;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const vintages = await Vintage.find(query)
      .populate({
        path: 'wine',
        populate: { path: 'winery', select: 'name' }
      })
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .sort({ year: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Vintage.countDocuments(query);

    res.json({
      success: true,
      count: vintages.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: vintages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/vintages/:id
// @desc    Get single vintage
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vintage = await Vintage.findById(req.params.id)
      .populate({
        path: 'wine',
        populate: { path: 'winery' }
      })
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!vintage) {
      return res.status(404).json({
        success: false,
        message: 'Vintage not found'
      });
    }

    res.json({
      success: true,
      data: vintage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/vintages
// @desc    Create new vintage
// @access  Private (Admin, Editor)
router.post('/', [
  protect,
  authorize('admin', 'editor'),
  body('wine').notEmpty().withMessage('Wine is required'),
  body('year').isInt({ min: 1900 }).withMessage('Valid year is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    // Verify wine exists
    const wine = await Wine.findById(req.body.wine);
    if (!wine) {
      return res.status(404).json({
        success: false,
        message: 'Wine not found'
      });
    }

    // Check if vintage already exists for this wine
    const existingVintage = await Vintage.findOne({
      wine: req.body.wine,
      year: req.body.year
    });

    if (existingVintage) {
      return res.status(400).json({
        success: false,
        message: 'Vintage already exists for this wine and year'
      });
    }

    const vintageData = {
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    const vintage = await Vintage.create(vintageData);

    // Populate wine and winery data
    await vintage.populate({
      path: 'wine',
      populate: { path: 'winery', select: 'name' }
    });

    res.status(201).json({
      success: true,
      data: vintage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/vintages/:id
// @desc    Update vintage
// @access  Private (Admin, Editor)
router.put('/:id', [
  protect,
  authorize('admin', 'editor')
], async (req, res) => {
  try {
    let vintage = await Vintage.findById(req.params.id);

    if (!vintage) {
      return res.status(404).json({
        success: false,
        message: 'Vintage not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && vintage.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this vintage'
      });
    }

    vintage = await Vintage.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate({
      path: 'wine',
      populate: { path: 'winery', select: 'name' }
    });

    res.json({
      success: true,
      data: vintage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/vintages/:id
// @desc    Delete vintage
// @access  Private (Admin, Editor)
router.delete('/:id', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const vintage = await Vintage.findById(req.params.id);

    if (!vintage) {
      return res.status(404).json({
        success: false,
        message: 'Vintage not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && vintage.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this vintage'
      });
    }

    await vintage.deleteOne();

    res.json({
      success: true,
      message: 'Vintage deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/vintages/:id/assets/:assetType
// @desc    Update vintage asset
// @access  Private (Admin, Editor)
router.put('/:id/assets/:assetType', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { assetType } = req.params;
    const allowedTypes = ['bottleImage', 'labelImage', 'techSheet', 'tastingCard', 'lifestyleImage', 'shelfTalker'];

    if (!allowedTypes.includes(assetType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid asset type'
      });
    }

    const vintage = await Vintage.findById(req.params.id);

    if (!vintage) {
      return res.status(404).json({
        success: false,
        message: 'Vintage not found'
      });
    }

    // Update asset
    vintage.assets[assetType] = req.body;
    vintage.updatedBy = req.user.id;
    await vintage.save();

    res.json({
      success: true,
      data: vintage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/vintages/:id/assets/:assetType
// @desc    Delete vintage asset
// @access  Private (Admin, Editor)
router.delete('/:id/assets/:assetType', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { assetType } = req.params;
    const allowedTypes = ['bottleImage', 'labelImage', 'techSheet', 'tastingCard', 'lifestyleImage', 'shelfTalker'];

    if (!allowedTypes.includes(assetType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid asset type'
      });
    }

    const vintage = await Vintage.findById(req.params.id);

    if (!vintage) {
      return res.status(404).json({
        success: false,
        message: 'Vintage not found'
      });
    }

    // Clear asset
    vintage.assets[assetType] = undefined;
    vintage.updatedBy = req.user.id;
    await vintage.save();

    res.json({
      success: true,
      data: vintage
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
