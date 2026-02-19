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
  country: {
    type: String,
    trim: true
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
  // Nutrition & Ingredients (TTB proposed regulations 2025)
  nutrition: {
    // Alcohol Facts Statement fields
    servingSize: {
      type: Number, // in ml or oz
      default: 5 // 5 oz standard wine serving
    },
    servingsPerContainer: {
      type: Number
    },
    alcoholByVolume: {
      type: Number, // percentage (e.g., 13.5)
      min: 0,
      max: 100
    },
    alcoholPerServing: {
      type: Number // fluid ounces of pure ethyl alcohol per serving
    },
    caloriesPerServing: {
      type: Number
    },
    carbohydratesPerServing: {
      type: Number // in grams
    },
    fatPerServing: {
      type: Number, // in grams
      default: 0
    },
    proteinPerServing: {
      type: Number, // in grams
      default: 0
    },
    sugarPerServing: {
      type: Number // in grams (optional, commonly requested)
    }
  },
  ingredients: {
    // List of ingredients used in production
    primaryIngredients: [{
      type: String,
      trim: true
    }],
    additives: [{
      type: String,
      trim: true
    }],
    // Major Food Allergens (TTB Notice No. 238 - proposed 2025)
    allergens: {
      milk: { type: Boolean, default: false },
      eggs: { type: Boolean, default: false },
      fish: { type: Boolean, default: false },
      crustaceanShellfish: { type: Boolean, default: false },
      treeNuts: { type: Boolean, default: false },
      wheat: { type: Boolean, default: false },
      peanuts: { type: Boolean, default: false },
      soybeans: { type: Boolean, default: false },
      sesame: { type: Boolean, default: false }
    },
    // Optional notes
    processingAids: [{
      type: String,
      trim: true
    }],
    notes: {
      type: String,
      trim: true
    }
  },
  // QR Code for compliance (can be generated from this data)
  complianceQRCode: {
    url: String,
    generatedAt: Date
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
