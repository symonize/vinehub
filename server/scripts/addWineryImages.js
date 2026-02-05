require('dotenv').config();
const mongoose = require('mongoose');
const Winery = require('../models/Winery');
const { getRandomVineyardImage } = require('../utils/unsplash');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/winehub';

/**
 * Script to bulk add featured images to wineries from Unsplash
 *
 * Usage:
 * node server/scripts/addWineryImages.js [--overwrite]
 *
 * Options:
 * --overwrite: Replace existing images (default: only add to wineries without images)
 */

const addWineryImages = async (overwrite = false) => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get wineries without featured images or all if overwrite is true
    const query = overwrite ? {} : { 'featuredImage.path': { $exists: false } };
    const wineries = await Winery.find(query);

    if (wineries.length === 0) {
      console.log('✅ All wineries already have featured images!');
      await mongoose.connection.close();
      return;
    }

    console.log(`\n📸 Adding images to ${wineries.length} wineries...`);
    console.log('─'.repeat(60));

    let successCount = 0;
    let errorCount = 0;

    for (const winery of wineries) {
      try {
        console.log(`\n🍷 ${winery.name}`);
        console.log('   Fetching vineyard image from Unsplash...');

        const image = await getRandomVineyardImage('vineyard,winery,wine estate');

        winery.featuredImage = {
          filename: `${image.id}.jpg`,
          path: image.url,
          mimetype: 'image/jpeg',
          size: 0,
          uploadedAt: new Date()
        };

        await winery.save();

        console.log(`   ✅ Added image by ${image.photographer}`);
        console.log(`   🔗 ${image.url}`);
        successCount++;

        // Add a small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '─'.repeat(60));
    console.log(`\n✅ Complete!`);
    console.log(`   Success: ${successCount}`);
    if (errorCount > 0) {
      console.log(`   Errors: ${errorCount}`);
    }

    console.log('\n📝 Note: Images are from Unsplash and require attribution.');
    console.log('   Photographer credits are stored with each image.\n');

    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const overwrite = args.includes('--overwrite');

if (overwrite) {
  console.log('⚠️  Overwrite mode: Will replace existing images\n');
}

addWineryImages(overwrite);
