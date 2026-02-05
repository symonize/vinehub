const mongoose = require('mongoose');

const wineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Wine name is required'],
    trim: true
  },
  winery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Winery',
    required: [true, 'Winery is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  region: {
    type: String,
    required: [true, 'Region is required'],
    enum: [
      'Napa Valley',
      'Sonoma County',
      'Paso Robles',
      'Santa Barbara',
      'Willamette Valley',
      'Finger Lakes',
      'Columbia Valley',
      'Walla Walla',
      'Russian River Valley',
      'Alexander Valley',
      'Other'
    ]
  },
  type: {
    type: String,
    required: [true, 'Wine type is required'],
    enum: ['red', 'white', 'sparkling', 'rosé', 'dessert', 'fortified']
  },
  tastingNotes: {
    type: String,
    required: [true, 'Tasting notes are required']
  },
  variety: {
    type: String,
    required: [true, 'Variety is required'],
    trim: true
  },
  foodPairing: {
    type: String,
    required: [true, 'Food pairing is required']
  },
  bottleImage: {
    url: String,
    generatedAt: Date,
    prompt: String
  },
  awards: [{
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    awardName: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1
    }
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

// Virtual for vintages
wineSchema.virtual('vintages', {
  ref: 'Vintage',
  localField: '_id',
  foreignField: 'wine'
});

// Index for faster searches
wineSchema.index({ name: 'text', variety: 'text', description: 'text' });
wineSchema.index({ winery: 1, type: 1 });

module.exports = mongoose.model('Wine', wineSchema);
