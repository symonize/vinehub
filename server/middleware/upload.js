const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('[upload middleware] Cloudinary cloud_name:', process.env.CLOUDINARY_CLOUD_NAME || 'MISSING');
console.log('[upload middleware] Cloudinary api_key set:', !!process.env.CLOUDINARY_API_KEY);
console.log('[upload middleware] Cloudinary api_secret set:', !!process.env.CLOUDINARY_API_SECRET);

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isRaw = file.mimetype === 'application/pdf' || file.mimetype === 'image/svg+xml';
    return {
      folder: 'winehub',
      resource_type: isRaw ? 'raw' : 'image',
      allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg', 'pdf', 'doc', 'docx'],
      use_filename: false,
      unique_filename: true
    };
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimetypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimetypes.includes(file.mimetype)) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, SVG, PDF, DOC, and DOCX files are allowed.'));
  }
};

// Configure multer
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  },
  fileFilter
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

module.exports = { upload, handleMulterError, cloudinary };
