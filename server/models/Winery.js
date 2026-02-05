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
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: Date
  },
  logo: {
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: Date
  },
  lifestyleImages: [{
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: Date,
    caption: String
  }],
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

// Index for faster searches
winerySchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Winery', winerySchema);
