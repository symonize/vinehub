const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { upload, handleMulterError } = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/upload
// @desc    Upload single file
// @access  Private (Admin, Editor)
router.post('/',
  protect,
  authorize('admin', 'editor'),
  upload.single('file'),
  handleMulterError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Convert absolute path to relative path for URL access
      const relativePath = req.file.path.replace(/^\.\//, '').replace(/\\/g, '/');

      const fileData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: relativePath,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date(),
        uploadedBy: req.user.id
      };

      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: fileData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// @route   POST /api/upload/multiple
// @desc    Upload multiple files
// @access  Private (Admin, Editor)
router.post('/multiple',
  protect,
  authorize('admin', 'editor'),
  upload.array('files', 10),
  handleMulterError,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const filesData = req.files.map(file => {
        // Convert absolute path to relative path for URL access
        const relativePath = file.path.replace(/^\.\//, '').replace(/\\/g, '/');

        return {
          filename: file.filename,
          originalName: file.originalname,
          path: relativePath,
          mimetype: file.mimetype,
          size: file.size,
          uploadedAt: new Date(),
          uploadedBy: req.user.id
        };
      });

      res.json({
        success: true,
        message: `${req.files.length} files uploaded successfully`,
        data: filesData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// @route   DELETE /api/upload/:filename
// @desc    Delete uploaded file
// @access  Private (Admin, Editor)
router.delete('/:filename', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { filename } = req.params;
    const uploadDir = process.env.UPLOAD_PATH || './uploads';

    // Search for file in subdirectories
    const subdirs = ['images', 'documents', 'others'];
    let deleted = false;

    for (const subdir of subdirs) {
      const filePath = path.join(uploadDir, subdir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/upload/:subdir/:filename
// @desc    Serve uploaded file
// @access  Public
router.get('/:subdir/:filename', (req, res) => {
  try {
    const { subdir, filename } = req.params;
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    const filePath = path.join(uploadDir, subdir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.sendFile(path.resolve(filePath));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
