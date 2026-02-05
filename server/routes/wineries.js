const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Winery = require('../models/Winery');
const Wine = require('../models/Wine');
const { protect, authorize } = require('../middleware/auth');

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

module.exports = router;
