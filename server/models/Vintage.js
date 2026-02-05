const mongoose = require('mongoose');

const vintageSchema = new mongoose.Schema({
  wine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wine',
    required: [true, 'Wine is required']
  },
  year: {
    type: Number,
    required: [true, 'Vintage year is required'],
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  assets: {
    bottleImage: {
      filename: String,
      path: String,
      mimetype: String,
      size: Number,
      uploadedAt: Date
    },
    techSheet: {
      filename: String,
      path: String,
      mimetype: String,
      size: Number,
      uploadedAt: Date
    },
    shelfTalker: {
      filename: String,
      path: String,
      mimetype: String,
      size: Number,
      uploadedAt: Date
    },
    tastingCard: {
      filename: String,
      path: String,
      mimetype: String,
      size: Number,
      uploadedAt: Date
    },
    labelImage: {
      filename: String,
      path: String,
      mimetype: String,
      size: Number,
      uploadedAt: Date
    }
  },
  notes: {
    type: String,
    trim: true
  },
  production: {
    cases: Number,
    bottles: Number
  },
  pricing: {
    wholesale: Number,
    retail: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index to ensure unique wine-year combinations
vintageSchema.index({ wine: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Vintage', vintageSchema);
