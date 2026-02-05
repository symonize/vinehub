const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Wine = require('../models/Wine');
const Winery = require('../models/Winery');
const Vintage = require('../models/Vintage');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/wines
// @desc    Get all wines
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { winery, type, region, status, search, page = 1, limit = 10 } = req.query;

    let query = {};

    // Filter by winery
    if (winery) {
      query.winery = winery;
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by region
    if (region) {
      query.region = region;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { variety: { $regex: search, $options: 'i' } },
        { region: { $regex: search, $options: 'i' } }
      ];
    }

    const wines = await Wine.find(query)
      .populate('winery', 'name logo')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Wine.countDocuments(query);

    res.json({
      success: true,
      count: wines.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: wines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/wines/:id
// @desc    Get single wine
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const wine = await Wine.findById(req.params.id)
      .populate('winery')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate({
        path: 'vintages',
        options: { sort: { year: -1 } }
      });

    if (!wine) {
      return res.status(404).json({
        success: false,
        message: 'Wine not found'
      });
    }

    res.json({
      success: true,
      data: wine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/wines
// @desc    Create new wine
// @access  Private (Admin, Editor)
router.post('/', [
  protect,
  authorize('admin', 'editor'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('winery').notEmpty().withMessage('Winery is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('region').notEmpty().withMessage('Region is required'),
  body('type').isIn(['red', 'white', 'sparkling', 'rosé', 'dessert', 'fortified']).withMessage('Invalid wine type'),
  body('tastingNotes').notEmpty().withMessage('Tasting notes are required'),
  body('variety').notEmpty().withMessage('Variety is required'),
  body('foodPairing').notEmpty().withMessage('Food pairing is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    // Verify winery exists
    const winery = await Winery.findById(req.body.winery);
    if (!winery) {
      return res.status(404).json({
        success: false,
        message: 'Winery not found'
      });
    }

    const wineData = {
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    const wine = await Wine.create(wineData);

    // Populate winery data
    await wine.populate('winery', 'name logo');

    res.status(201).json({
      success: true,
      data: wine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/wines/:id
// @desc    Update wine
// @access  Private (Admin, Editor)
router.put('/:id', [
  protect,
  authorize('admin', 'editor')
], async (req, res) => {
  try {
    let wine = await Wine.findById(req.params.id);

    if (!wine) {
      return res.status(404).json({
        success: false,
        message: 'Wine not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && wine.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this wine'
      });
    }

    wine = await Wine.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate('winery', 'name logo');

    res.json({
      success: true,
      data: wine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/wines/:id
// @desc    Delete wine
// @access  Private (Admin, Editor)
router.delete('/:id', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const wine = await Wine.findById(req.params.id);

    if (!wine) {
      return res.status(404).json({
        success: false,
        message: 'Wine not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && wine.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this wine'
      });
    }

    // Delete associated vintages
    await Vintage.deleteMany({ wine: req.params.id });

    await wine.deleteOne();

    res.json({
      success: true,
      message: 'Wine and associated vintages deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/wines/:id/awards
// @desc    Add award to wine
// @access  Private (Admin, Editor)
router.post('/:id/awards', [
  protect,
  authorize('admin', 'editor'),
  body('score').isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('awardName').trim().notEmpty().withMessage('Award name is required'),
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
    const wine = await Wine.findById(req.params.id);

    if (!wine) {
      return res.status(404).json({
        success: false,
        message: 'Wine not found'
      });
    }

    wine.awards.push(req.body);
    wine.updatedBy = req.user.id;
    await wine.save();

    res.json({
      success: true,
      data: wine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/wines/:id/awards/:awardId
// @desc    Remove award from wine
// @access  Private (Admin, Editor)
router.delete('/:id/awards/:awardId', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const wine = await Wine.findById(req.params.id);

    if (!wine) {
      return res.status(404).json({
        success: false,
        message: 'Wine not found'
      });
    }

    wine.awards = wine.awards.filter(award => award._id.toString() !== req.params.awardId);
    wine.updatedBy = req.user.id;
    await wine.save();

    res.json({
      success: true,
      data: wine
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
