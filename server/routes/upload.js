const express = require('express');
const router = express.Router();
const { upload, handleMulterError, cloudinary } = require('../middleware/upload');
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

      const fileData = {
        filename: req.file.originalname,
        originalName: req.file.originalname,
        url: req.file.path,           // Cloudinary CDN URL
        public_id: req.file.filename, // Cloudinary public_id (for deletion)
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

      const filesData = req.files.map(file => ({
        filename: file.originalname,
        originalName: file.originalname,
        url: file.path,
        public_id: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
        uploadedBy: req.user.id
      }));

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

// @route   DELETE /api/upload/:public_id
// @desc    Delete uploaded file from Cloudinary
// @access  Private (Admin, Editor)
router.delete('/:public_id(*)', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const public_id = req.params.public_id;

    // Try image first, then raw (PDFs are stored as raw)
    const imageResult = await cloudinary.uploader.destroy(public_id, { resource_type: 'image' });
    if (imageResult.result !== 'ok') {
      await cloudinary.uploader.destroy(public_id, { resource_type: 'raw' }).catch(() => {});
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

module.exports = router;
