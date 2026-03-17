const mongoose = require('mongoose');

const winerySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Winery name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  featuredImage: {
    filename: String,
    url: String,
    path: String,    // legacy field — kept so old documents still serialize
    public_id: String,
    mimetype: String,
    size: Number,
    uploadedAt: Date
  },
  logo: {
    filename: String,
    url: String,
    path: String,    // legacy field
    public_id: String,
    mimetype: String,
    size: Number,
    uploadedAt: Date
  },
  lifestyleImages: [{
    filename: String,
    url: String,
    path: String,    // legacy field
    public_id: String,
    mimetype: String,
    size: Number,
    uploadedAt: Date,
    caption: String
  }],
  country: {
    type: String,
    trim: true
  },
  region: {
    type: String,
    trim: true
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for wines
winerySchema.virtual('wines', {
  ref: 'Wine',
  localField: '_id',
  foreignField: 'winery'
});

// Indexes for faster searches and filtering
winerySchema.index({ name: 'text', description: 'text' });
winerySchema.index({ status: 1 });

module.exports = mongoose.model('Winery', winerySchema);
