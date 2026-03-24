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
      url: String,
      path: String,    // legacy field
      public_id: String,
      mimetype: String,
      size: Number,
      uploadedAt: Date
    },
    labelImage: {
      filename: String,
      url: String,
      path: String,    // legacy field
      public_id: String,
      mimetype: String,
      size: Number,
      uploadedAt: Date
    },
    techSheet: {
      filename: String,
      url: String,
      path: String,    // legacy field
      public_id: String,
      mimetype: String,
      size: Number,
      uploadedAt: Date
    },
    tastingCard: {
      filename: String,
      url: String,
      path: String,    // legacy field
      public_id: String,
      mimetype: String,
      size: Number,
      uploadedAt: Date
    },
    lifestyleImage: {
      filename: String,
      url: String,
      path: String,    // legacy field
      public_id: String,
      mimetype: String,
      size: Number,
      uploadedAt: Date
    },
    shelfTalker: {
      filename: String,
      url: String,
      path: String,    // legacy field
      public_id: String,
      mimetype: String,
      size: Number,
      uploadedAt: Date
    }
  },
  productionVolume: Number,
  releaseDate: Date,
  tastingNotes: { type: String, trim: true },
  harvestNotes: { type: String, trim: true },
  agingProcess: { type: String, trim: true },
  oakTreatment: { type: String, trim: true },
  blendDetails: { type: String, trim: true },
  awards: [{
    organization: { type: String, required: true },
    score: { type: Number, min: 0, max: 100 }
  }],
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
    default: 'published'
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
vintageSchema.index({ status: 1 });

module.exports = mongoose.model('Vintage', vintageSchema);
