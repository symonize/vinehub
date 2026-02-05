require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Winery = require('./models/Winery');
const Wine = require('./models/Wine');
const Vintage = require('./models/Vintage');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Winery.deleteMany();
    await Wine.deleteMany();
    await Vintage.deleteMany();

    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      email: 'admin@winehub.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    console.log('Created admin user');

    // Create 10 Wineries
    const wineries = await Winery.create([
      {
        name: 'Silver Oak Cellars',
        description: 'Renowned Napa Valley winery specializing in bold, age-worthy Cabernet Sauvignon wines since 1972. Known for American oak aging and distinctive style.',
        status: 'published',
        createdBy: admin._id,
        updatedBy: admin._id
      },
      {
        name: 'Sonoma-Cutrer Vineyards',
        description: 'Premier Sonoma County estate dedicated to world-class Chardonnay production. Established in 1981 with sustainably farmed vineyards.',
        status: 'published',
        createdBy: admin._id,
        updatedBy: admin._id
      },
      {
        name: 'Domaine Carneros',
        description: 'Elegant sparkling wine house in Carneros, founded by Champagne Taittinger. Specializing in traditional method sparkling wines since 1987.',
        status: 'published',
        createdBy: admin._id,
        updatedBy: admin._id
      },
      {
        name: 'Ridge Vineyards',
        description: 'Historic Paso Robles winery crafting exceptional Zinfandel and Rhône varietals from mountain vineyards dating back to 1885.',
        status: 'published',
        createdBy: admin._id,
        updatedBy: admin._id
      },
      {
        name: 'Willamette Valley Estate',
        description: 'Oregon Pinot Noir specialist producing elegant, terroir-driven wines from cool-climate vineyards in the heart of Willamette Valley.',
        status: 'published',
        createdBy: admin._id,
        updatedBy: admin._id
      },
      {
        name: 'Santa Barbara Vintners',
        description: 'Coastal California winery focusing on Burgundian and Rhône varietals. Known for sustainable farming and minimal intervention winemaking.',
        status: 'published',
        createdBy: admin._id,
        updatedBy: admin._id
      },
      {
        name: 'Finger Lakes Wine Company',
        description: 'New York estate specializing in cool-climate Riesling and sparkling wines. Family-owned since 1998 on the shores of Seneca Lake.',
        status: 'published',
        createdBy: admin._id,
        updatedBy: admin._id
      },
      {
        name: 'Columbia Crest',
        description: 'Washington State leader in premium wines from Columbia Valley. Pioneering sustainable viticulture with diverse portfolio.',
        status: 'published',
        createdBy: admin._id,
        updatedBy: admin._id
      },
      {
        name: 'Russian River Cellars',
        description: 'Boutique Sonoma winery specializing in cool-climate Pinot Noir and Chardonnay from the renowned Russian River Valley.',
        status: 'published',
        createdBy: admin._id,
        updatedBy: admin._id
      },
      {
        name: 'Walla Walla Vineyards',
        description: 'Premium Washington winery producing bold reds and elegant whites. Family estate established in 1995 in historic Walla Walla Valley.',
        status: 'published',
        createdBy: admin._id,
        updatedBy: admin._id
      }
    ]);

    console.log('Created 10 wineries');

    // Create 50 Wines with variety
    const wines = await Wine.create([
      // Silver Oak Cellars (5 wines)
      {
        name: 'Alexander Valley Cabernet Sauvignon',
        winery: wineries[0]._id,
        description: 'Bold and structured Cabernet with signature American oak influence. Estate-grown fruit from Alexander Valley.',
        region: 'Alexander Valley',
        type: 'red',
        tastingNotes: 'Rich blackberry, dark chocolate, and vanilla. Full-bodied with velvety tannins and long finish.',
        variety: '100% Cabernet Sauvignon',
        foodPairing: 'Prime rib, grilled lamb chops, aged blue cheese.',
        awards: [
          { score: 96, awardName: 'Wine Spectator', year: 2023 },
          { score: 94, awardName: 'Wine Advocate', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Napa Valley Reserve',
        winery: wineries[0]._id,
        description: 'Flagship Cabernet Sauvignon from select Napa Valley vineyards. Aged 24 months in new American oak.',
        region: 'Napa Valley',
        type: 'red',
        tastingNotes: 'Cassis, cedar, toasted oak, and espresso. Powerful yet elegant with refined structure.',
        variety: '95% Cabernet Sauvignon, 5% Merlot',
        foodPairing: 'Dry-aged steak, braised short ribs, wild mushroom risotto.',
        awards: [
          { score: 97, awardName: 'Wine Spectator', year: 2023 },
          { score: 95, awardName: 'James Suckling', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Cabernet Franc',
        winery: wineries[0]._id,
        description: 'Elegant expression of estate-grown Cabernet Franc with herbaceous complexity.',
        region: 'Napa Valley',
        type: 'red',
        tastingNotes: 'Red cherry, bell pepper, violet, and tobacco leaf. Medium-bodied with bright acidity.',
        variety: '100% Cabernet Franc',
        foodPairing: 'Herb-crusted lamb, ratatouille, grilled vegetables.',
        awards: [
          { score: 92, awardName: 'Wine Enthusiast', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Merlot Reserve',
        winery: wineries[0]._id,
        description: 'Smooth and approachable Merlot with lush fruit character.',
        region: 'Napa Valley',
        type: 'red',
        tastingNotes: 'Plum, black cherry, mocha, and soft vanilla. Round tannins with silky texture.',
        variety: '90% Merlot, 10% Cabernet Sauvignon',
        foodPairing: 'Duck confit, mushroom pasta, roasted pork.',
        awards: [
          { score: 91, awardName: 'Wine Spectator', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Petit Verdot',
        winery: wineries[0]._id,
        description: 'Intense and concentrated single-varietal Petit Verdot from hillside vineyards.',
        region: 'Napa Valley',
        type: 'red',
        tastingNotes: 'Blackberry, violet, black pepper, and graphite. Bold tannins with age-worthy structure.',
        variety: '100% Petit Verdot',
        foodPairing: 'Venison, wild boar, strong aged cheeses.',
        awards: [
          { score: 93, awardName: 'Wine Advocate', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },

      // Sonoma-Cutrer Vineyards (5 wines)
      {
        name: 'Russian River Ranches Chardonnay',
        winery: wineries[1]._id,
        description: 'Classic cool-climate Chardonnay from estate vineyards in Russian River Valley.',
        region: 'Russian River Valley',
        type: 'white',
        tastingNotes: 'Green apple, pear, citrus, and subtle oak. Crisp acidity with creamy texture.',
        variety: '100% Chardonnay',
        foodPairing: 'Grilled salmon, lobster, chicken piccata.',
        awards: [
          { score: 93, awardName: 'Wine Spectator', year: 2024 },
          { score: 91, awardName: 'Wine Enthusiast', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Les Pierres Chardonnay',
        winery: wineries[1]._id,
        description: 'Premier single-vineyard Chardonnay from rocky limestone soils.',
        region: 'Sonoma County',
        type: 'white',
        tastingNotes: 'Meyer lemon, white peach, hazelnut, and minerality. Complex with elegant structure.',
        variety: '100% Chardonnay',
        foodPairing: 'Scallops, truffle risotto, soft cheeses.',
        awards: [
          { score: 95, awardName: 'Wine Advocate', year: 2024 },
          { score: 94, awardName: 'James Suckling', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Sonoma Coast Chardonnay',
        winery: wineries[1]._id,
        description: 'Elegant coastal Chardonnay with bright acidity and mineral character.',
        region: 'Sonoma County',
        type: 'white',
        tastingNotes: 'Granny Smith apple, lime zest, flint, and sea salt. Vibrant with steely finish.',
        variety: '100% Chardonnay',
        foodPairing: 'Oysters, ceviche, grilled fish.',
        awards: [
          { score: 92, awardName: 'Wine Spectator', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Founders Reserve Chardonnay',
        winery: wineries[1]._id,
        description: 'Limited production Chardonnay from the estate\'s finest blocks.',
        region: 'Russian River Valley',
        type: 'white',
        tastingNotes: 'Baked apple, butterscotch, toasted almond, and vanilla. Rich and luxurious.',
        variety: '100% Chardonnay',
        foodPairing: 'Lobster thermidor, duck breast, aged Gruyère.',
        awards: [
          { score: 96, awardName: 'Wine Advocate', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Cutrer Vineyard Chardonnay',
        winery: wineries[1]._id,
        description: 'Estate bottling showcasing the unique terroir of Cutrer Vineyard.',
        region: 'Russian River Valley',
        type: 'white',
        tastingNotes: 'Ripe pear, honeydew, ginger, and oak spice. Balanced with persistent finish.',
        variety: '100% Chardonnay',
        foodPairing: 'Roasted chicken, seafood pasta, Brie.',
        awards: [
          { score: 90, awardName: 'Wine Enthusiast', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },

      // Domaine Carneros (5 wines)
      {
        name: 'Brut Cuvée',
        winery: wineries[2]._id,
        description: 'Classic méthode traditionnelle sparkling wine with fine bubbles and elegance.',
        region: 'Napa Valley',
        type: 'sparkling',
        tastingNotes: 'Green apple, brioche, almond, and citrus. Crisp with persistent mousse.',
        variety: '60% Pinot Noir, 40% Chardonnay',
        foodPairing: 'Oysters, caviar, soft cheeses, light appetizers.',
        awards: [
          { score: 93, awardName: 'Wine Spectator', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Brut Rosé',
        winery: wineries[2]._id,
        description: 'Elegant pink sparkling wine with delicate berry flavors.',
        region: 'Napa Valley',
        type: 'sparkling',
        tastingNotes: 'Strawberry, raspberry, rose petal, and toast. Refined with creamy texture.',
        variety: '65% Pinot Noir, 35% Chardonnay',
        foodPairing: 'Salmon, prosciutto, berry desserts.',
        awards: [
          { score: 94, awardName: 'Wine Enthusiast', year: 2024 },
          { score: 92, awardName: 'Wine Advocate', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Blanc de Blancs',
        winery: wineries[2]._id,
        description: '100% Chardonnay sparkling wine with precision and minerality.',
        region: 'Napa Valley',
        type: 'sparkling',
        tastingNotes: 'Lemon, white peach, chalk, and hazelnut. Elegant with fine acidity.',
        variety: '100% Chardonnay',
        foodPairing: 'Lobster, scallops, goat cheese.',
        awards: [
          { score: 95, awardName: 'Wine Spectator', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Le Rêve Blanc de Blancs',
        winery: wineries[2]._id,
        description: 'Prestige cuvée aged on lees for exceptional complexity.',
        region: 'Napa Valley',
        type: 'sparkling',
        tastingNotes: 'Meyer lemon, crème brûlée, almond paste, and sea spray. Rich yet refined.',
        variety: '100% Chardonnay',
        foodPairing: 'Foie gras, truffles, aged Parmesan.',
        awards: [
          { score: 97, awardName: 'Wine Advocate', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Vintage Brut',
        winery: wineries[2]._id,
        description: 'Exceptional vintage sparkling wine from outstanding harvest years.',
        region: 'Napa Valley',
        type: 'sparkling',
        tastingNotes: 'Baked apple, honey, toasted bread, and white flowers. Complex and age-worthy.',
        variety: '55% Pinot Noir, 45% Chardonnay',
        foodPairing: 'Lobster bisque, roasted quail, aged cheeses.',
        awards: [
          { score: 96, awardName: 'Wine Spectator', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },

      // Ridge Vineyards (5 wines)
      {
        name: 'Geyserville Zinfandel',
        winery: wineries[3]._id,
        description: 'Historic field blend Zinfandel from mountain vineyards planted in 1880s.',
        region: 'Paso Robles',
        type: 'red',
        tastingNotes: 'Blackberry jam, black pepper, dried herbs, and earth. Full-bodied with rustic character.',
        variety: '68% Zinfandel, 20% Carignane, 12% Petite Sirah',
        foodPairing: 'BBQ ribs, spicy sausage, hearty stews.',
        awards: [
          { score: 94, awardName: 'Wine Spectator', year: 2023 },
          { score: 93, awardName: 'Wine Advocate', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Lytton Springs Zinfandel',
        winery: wineries[3]._id,
        description: 'Powerful Zinfandel from dry-farmed hillside vines.',
        region: 'Paso Robles',
        type: 'red',
        tastingNotes: 'Wild berry, licorice, cinnamon, and smoke. Bold with firm structure.',
        variety: '75% Zinfandel, 18% Petite Sirah, 7% Carignane',
        foodPairing: 'Smoked brisket, lamb shanks, aged cheddar.',
        awards: [
          { score: 95, awardName: 'Wine Advocate', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Grenache',
        winery: wineries[3]._id,
        description: 'Elegant Rhône-style Grenache from old vines.',
        region: 'Paso Robles',
        type: 'red',
        tastingNotes: 'Red cherry, raspberry, white pepper, and garrigue. Silky with bright acidity.',
        variety: '85% Grenache, 10% Mourvèdre, 5% Syrah',
        foodPairing: 'Roasted lamb, ratatouille, goat cheese.',
        awards: [
          { score: 92, awardName: 'Wine Enthusiast', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Petite Sirah',
        winery: wineries[3]._id,
        description: 'Dense and powerful single-varietal Petite Sirah.',
        region: 'Paso Robles',
        type: 'red',
        tastingNotes: 'Blueberry, violet, cocoa, and leather. Massive tannins with aging potential.',
        variety: '100% Petite Sirah',
        foodPairing: 'Grilled steak, wild game, strong cheeses.',
        awards: [
          { score: 93, awardName: 'Wine Spectator', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Carignane',
        winery: wineries[3]._id,
        description: 'Rare old-vine Carignane with rustic charm.',
        region: 'Paso Robles',
        type: 'red',
        tastingNotes: 'Dark fruit, dried herbs, earth, and spice. Structured with savory finish.',
        variety: '100% Carignane',
        foodPairing: 'Beef stew, grilled sausages, aged Gouda.',
        awards: [
          { score: 91, awardName: 'Wine Advocate', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },

      // Willamette Valley Estate (5 wines)
      {
        name: 'Estate Pinot Noir',
        winery: wineries[4]._id,
        description: 'Classic Oregon Pinot Noir with elegance and complexity.',
        region: 'Willamette Valley',
        type: 'red',
        tastingNotes: 'Red cherry, cranberry, mushroom, and forest floor. Silky with bright acidity.',
        variety: '100% Pinot Noir',
        foodPairing: 'Roasted duck, grilled salmon, mushroom risotto.',
        awards: [
          { score: 94, awardName: 'Wine Spectator', year: 2023 },
          { score: 93, awardName: 'Wine Enthusiast', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Reserve Pinot Noir',
        winery: wineries[4]._id,
        description: 'Premium selection from estate\'s oldest blocks.',
        region: 'Willamette Valley',
        type: 'red',
        tastingNotes: 'Black cherry, rose petal, tea leaf, and spice. Refined with velvety texture.',
        variety: '100% Pinot Noir',
        foodPairing: 'Coq au vin, beef Wellington, aged Comté.',
        awards: [
          { score: 96, awardName: 'Wine Advocate', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Pinot Gris',
        winery: wineries[4]._id,
        description: 'Crisp and aromatic Pinot Gris from cool-climate vineyards.',
        region: 'Willamette Valley',
        type: 'white',
        tastingNotes: 'Pear, honeysuckle, ginger, and citrus. Fresh with mineral edge.',
        variety: '100% Pinot Gris',
        foodPairing: 'Crab cakes, Caesar salad, fresh cheeses.',
        awards: [
          { score: 90, awardName: 'Wine Spectator', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Chardonnay',
        winery: wineries[4]._id,
        description: 'Burgundian-style Chardonnay with restraint and finesse.',
        region: 'Willamette Valley',
        type: 'white',
        tastingNotes: 'White peach, hazelnut, lemon zest, and subtle oak. Balanced with creamy texture.',
        variety: '100% Chardonnay',
        foodPairing: 'Roasted chicken, seafood pasta, Brie.',
        awards: [
          { score: 92, awardName: 'Wine Enthusiast', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Rosé of Pinot Noir',
        winery: wineries[4]._id,
        description: 'Dry rosé with delicate fruit and refreshing acidity.',
        region: 'Willamette Valley',
        type: 'rosé',
        tastingNotes: 'Strawberry, watermelon, rose hip, and citrus. Crisp and clean.',
        variety: '100% Pinot Noir',
        foodPairing: 'Salads, grilled vegetables, light seafood.',
        awards: [],
        status: 'published',
        createdBy: admin._id
      },

      // Santa Barbara Vintners (5 wines)
      {
        name: 'Syrah',
        winery: wineries[5]._id,
        description: 'Coastal Syrah with purity and elegance.',
        region: 'Santa Barbara',
        type: 'red',
        tastingNotes: 'Blackberry, olive tapenade, black pepper, and smoked meat. Medium-bodied with savory character.',
        variety: '100% Syrah',
        foodPairing: 'Grilled lamb, beef bourguignon, hard cheeses.',
        awards: [
          { score: 93, awardName: 'Wine Advocate', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Pinot Noir',
        winery: wineries[5]._id,
        description: 'Cool-climate Pinot Noir with coastal influence.',
        region: 'Santa Barbara',
        type: 'red',
        tastingNotes: 'Ripe cherry, baking spice, cola, and earth. Silky with elegant structure.',
        variety: '100% Pinot Noir',
        foodPairing: 'Duck breast, mushroom tart, soft cheeses.',
        awards: [
          { score: 92, awardName: 'Wine Spectator', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Chardonnay',
        winery: wineries[5]._id,
        description: 'Coastal Chardonnay with vibrant acidity and mineral notes.',
        region: 'Santa Barbara',
        type: 'white',
        tastingNotes: 'Lemon curd, green apple, flint, and sea breeze. Crisp with saline finish.',
        variety: '100% Chardonnay',
        foodPairing: 'Oysters, halibut, goat cheese.',
        awards: [
          { score: 91, awardName: 'Wine Enthusiast', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Grenache Blanc',
        winery: wineries[5]._id,
        description: 'Aromatic white Rhône varietal with texture and depth.',
        region: 'Santa Barbara',
        type: 'white',
        tastingNotes: 'White peach, honeysuckle, almond, and herbs. Rich with bright acidity.',
        variety: '100% Grenache Blanc',
        foodPairing: 'Grilled shrimp, chicken curry, aged Manchego.',
        awards: [
          { score: 90, awardName: 'Wine Spectator', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Viognier',
        winery: wineries[5]._id,
        description: 'Aromatic Viognier with lush fruit and floral notes.',
        region: 'Santa Barbara',
        type: 'white',
        tastingNotes: 'Apricot, honeysuckle, peach, and ginger. Full-bodied with oily texture.',
        variety: '100% Viognier',
        foodPairing: 'Thai cuisine, pork tenderloin, triple cream Brie.',
        awards: [],
        status: 'published',
        createdBy: admin._id
      },

      // Finger Lakes Wine Company (5 wines)
      {
        name: 'Dry Riesling',
        winery: wineries[6]._id,
        description: 'Classic Finger Lakes Riesling with precision and minerality.',
        region: 'Finger Lakes',
        type: 'white',
        tastingNotes: 'Lime, green apple, slate, and petrol. Bone dry with electric acidity.',
        variety: '100% Riesling',
        foodPairing: 'Sushi, oysters, Thai food, goat cheese.',
        awards: [
          { score: 93, awardName: 'Wine Spectator', year: 2024 },
          { score: 91, awardName: 'Wine Enthusiast', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Semi-Dry Riesling',
        winery: wineries[6]._id,
        description: 'Off-dry Riesling with perfect balance of sweetness and acidity.',
        region: 'Finger Lakes',
        type: 'white',
        tastingNotes: 'Ripe peach, honey, lime zest, and minerals. Refreshing with subtle sweetness.',
        variety: '100% Riesling',
        foodPairing: 'Spicy Asian cuisine, pork schnitzel, blue cheese.',
        awards: [
          { score: 92, awardName: 'Wine Advocate', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Gewürztraminer',
        winery: wineries[6]._id,
        description: 'Aromatic white with exotic spice and floral notes.',
        region: 'Finger Lakes',
        type: 'white',
        tastingNotes: 'Lychee, rose petal, ginger, and tropical fruit. Off-dry with lush texture.',
        variety: '100% Gewürztraminer',
        foodPairing: 'Indian cuisine, duck, aged cheeses.',
        awards: [
          { score: 90, awardName: 'Wine Spectator', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Sparkling Riesling',
        winery: wineries[6]._id,
        description: 'Traditional method sparkling Riesling with elegance.',
        region: 'Finger Lakes',
        type: 'sparkling',
        tastingNotes: 'Green apple, citrus, brioche, and flowers. Crisp with fine bubbles.',
        variety: '100% Riesling',
        foodPairing: 'Appetizers, sushi, fresh cheeses.',
        awards: [
          { score: 91, awardName: 'Wine Enthusiast', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Ice Wine',
        winery: wineries[6]._id,
        description: 'Decadent dessert wine from frozen grapes.',
        region: 'Finger Lakes',
        type: 'dessert',
        tastingNotes: 'Candied apricot, honey, orange marmalade, and caramel. Lusciously sweet with balancing acidity.',
        variety: '100% Riesling',
        foodPairing: 'Foie gras, fruit tarts, blue cheese.',
        awards: [
          { score: 95, awardName: 'Wine Spectator', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },

      // Columbia Crest (5 wines)
      {
        name: 'Grand Estates Cabernet Sauvignon',
        winery: wineries[7]._id,
        description: 'Washington Cabernet with power and elegance from Columbia Valley.',
        region: 'Columbia Valley',
        type: 'red',
        tastingNotes: 'Blackcurrant, cedar, tobacco, and dark chocolate. Full-bodied with structured tannins.',
        variety: '85% Cabernet Sauvignon, 10% Merlot, 5% Syrah',
        foodPairing: 'Grilled ribeye, lamb chops, aged cheddar.',
        awards: [
          { score: 92, awardName: 'Wine Spectator', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Merlot',
        winery: wineries[7]._id,
        description: 'Smooth Washington Merlot with ripe fruit character.',
        region: 'Columbia Valley',
        type: 'red',
        tastingNotes: 'Plum, cherry, cocoa, and vanilla. Supple with velvety finish.',
        variety: '90% Merlot, 10% Cabernet Sauvignon',
        foodPairing: 'Roasted pork, mushroom dishes, soft cheeses.',
        awards: [
          { score: 90, awardName: 'Wine Enthusiast', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Chardonnay',
        winery: wineries[7]._id,
        description: 'Crisp Washington Chardonnay with fruit-forward style.',
        region: 'Columbia Valley',
        type: 'white',
        tastingNotes: 'Golden apple, pineapple, butter, and oak. Rich with creamy texture.',
        variety: '100% Chardonnay',
        foodPairing: 'Grilled chicken, seafood pasta, Brie.',
        awards: [
          { score: 89, awardName: 'Wine Spectator', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Syrah',
        winery: wineries[7]._id,
        description: 'Bold Washington Syrah with spice and depth.',
        region: 'Columbia Valley',
        type: 'red',
        tastingNotes: 'Blackberry, black pepper, smoked meat, and leather. Full-bodied with firm tannins.',
        variety: '95% Syrah, 5% Viognier',
        foodPairing: 'BBQ ribs, grilled lamb, smoked Gouda.',
        awards: [
          { score: 91, awardName: 'Wine Advocate', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Riesling',
        winery: wineries[7]._id,
        description: 'Off-dry Washington Riesling with vibrant fruit.',
        region: 'Columbia Valley',
        type: 'white',
        tastingNotes: 'Peach, apricot, honey, and lime. Sweet with refreshing acidity.',
        variety: '100% Riesling',
        foodPairing: 'Spicy Thai, Indian cuisine, fruit desserts.',
        awards: [],
        status: 'published',
        createdBy: admin._id
      },

      // Russian River Cellars (5 wines)
      {
        name: 'Reserve Pinot Noir',
        winery: wineries[8]._id,
        description: 'Elegant Russian River Pinot Noir from select blocks.',
        region: 'Russian River Valley',
        type: 'red',
        tastingNotes: 'Bing cherry, raspberry, cola, and spice. Silky with refined tannins.',
        variety: '100% Pinot Noir',
        foodPairing: 'Duck breast, wild salmon, mushroom risotto.',
        awards: [
          { score: 94, awardName: 'Wine Spectator', year: 2023 },
          { score: 93, awardName: 'Wine Advocate', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Estate Chardonnay',
        winery: wineries[8]._id,
        description: 'Classic cool-climate Chardonnay with elegance.',
        region: 'Russian River Valley',
        type: 'white',
        tastingNotes: 'Meyer lemon, pear, hazelnut, and oak. Creamy with bright acidity.',
        variety: '100% Chardonnay',
        foodPairing: 'Lobster, roasted chicken, aged Comté.',
        awards: [
          { score: 92, awardName: 'Wine Enthusiast', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Pinot Noir Rosé',
        winery: wineries[8]._id,
        description: 'Dry rosé with bright fruit and refreshing character.',
        region: 'Russian River Valley',
        type: 'rosé',
        tastingNotes: 'Wild strawberry, melon, citrus, and herbs. Crisp and clean.',
        variety: '100% Pinot Noir',
        foodPairing: 'Summer salads, grilled shrimp, soft cheeses.',
        awards: [],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Old Vine Zinfandel',
        winery: wineries[8]._id,
        description: 'Concentrated Zinfandel from 60-year-old vines.',
        region: 'Russian River Valley',
        type: 'red',
        tastingNotes: 'Blackberry jam, vanilla, cinnamon, and tobacco. Rich with bold character.',
        variety: '85% Zinfandel, 10% Petite Sirah, 5% Carignane',
        foodPairing: 'BBQ, grilled meats, aged cheddar.',
        awards: [
          { score: 91, awardName: 'Wine Spectator', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Sauvignon Blanc',
        winery: wineries[8]._id,
        description: 'Crisp Sauvignon Blanc with citrus and herbal notes.',
        region: 'Russian River Valley',
        type: 'white',
        tastingNotes: 'Grapefruit, lime, grass, and gooseberry. Zesty with clean finish.',
        variety: '100% Sauvignon Blanc',
        foodPairing: 'Oysters, goat cheese salad, ceviche.',
        awards: [
          { score: 89, awardName: 'Wine Enthusiast', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },

      // Walla Walla Vineyards (5 wines)
      {
        name: 'Estate Cabernet Sauvignon',
        winery: wineries[9]._id,
        description: 'Powerful Walla Walla Cabernet with aging potential.',
        region: 'Walla Walla',
        type: 'red',
        tastingNotes: 'Cassis, dark cherry, espresso, and cedar. Full-bodied with firm structure.',
        variety: '92% Cabernet Sauvignon, 8% Petit Verdot',
        foodPairing: 'Prime rib, grilled lamb, aged Gouda.',
        awards: [
          { score: 95, awardName: 'Wine Advocate', year: 2023 },
          { score: 93, awardName: 'Wine Spectator', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Syrah Reserve',
        winery: wineries[9]._id,
        description: 'Premium Syrah from hillside vineyards.',
        region: 'Walla Walla',
        type: 'red',
        tastingNotes: 'Blueberry, violet, black pepper, and smoked bacon. Dense with muscular tannins.',
        variety: '96% Syrah, 4% Viognier',
        foodPairing: 'Braised lamb, wild game, aged cheeses.',
        awards: [
          { score: 94, awardName: 'Wine Spectator', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Merlot',
        winery: wineries[9]._id,
        description: 'Elegant Walla Walla Merlot with velvety texture.',
        region: 'Walla Walla',
        type: 'red',
        tastingNotes: 'Red plum, mocha, vanilla, and spice. Smooth with integrated tannins.',
        variety: '88% Merlot, 12% Cabernet Franc',
        foodPairing: 'Duck confit, beef bourguignon, soft cheeses.',
        awards: [
          { score: 91, awardName: 'Wine Enthusiast', year: 2023 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Chardonnay',
        winery: wineries[9]._id,
        description: 'Rich Walla Walla Chardonnay with oak influence.',
        region: 'Walla Walla',
        type: 'white',
        tastingNotes: 'Baked apple, butterscotch, toasted oak, and vanilla. Full-bodied with creamy texture.',
        variety: '100% Chardonnay',
        foodPairing: 'Lobster thermidor, roasted chicken, aged Gruyère.',
        awards: [
          { score: 90, awardName: 'Wine Spectator', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      },
      {
        name: 'Late Harvest Riesling',
        winery: wineries[9]._id,
        description: 'Sweet dessert wine with honeyed richness.',
        region: 'Walla Walla',
        type: 'dessert',
        tastingNotes: 'Apricot, honey, orange blossom, and caramel. Sweet with vibrant acidity.',
        variety: '100% Riesling',
        foodPairing: 'Fruit tarts, crème brûlée, blue cheese.',
        awards: [
          { score: 93, awardName: 'Wine Enthusiast', year: 2024 }
        ],
        status: 'published',
        createdBy: admin._id
      }
    ]);

    console.log('Created 50 wines across 10 wineries');

    // Create sample vintages for a few wines
    const vintagesData = [];

    // Add 2-3 vintages for first 15 wines
    for (let i = 0; i < 15; i++) {
      const wine = wines[i];
      const basePrice = Math.floor(Math.random() * 50) + 30;

      // Vintage 2021
      vintagesData.push({
        wine: wine._id,
        year: 2021,
        notes: 'Classic vintage with excellent balance',
        production: {
          cases: Math.floor(Math.random() * 500) + 300,
          bottles: Math.floor(Math.random() * 6000) + 3600
        },
        pricing: {
          wholesale: basePrice,
          retail: basePrice * 1.8,
          currency: 'USD'
        },
        status: 'published',
        createdBy: admin._id
      });

      // Vintage 2022
      vintagesData.push({
        wine: wine._id,
        year: 2022,
        notes: 'Outstanding quality with concentrated flavors',
        production: {
          cases: Math.floor(Math.random() * 500) + 300,
          bottles: Math.floor(Math.random() * 6000) + 3600
        },
        pricing: {
          wholesale: basePrice + 5,
          retail: (basePrice + 5) * 1.8,
          currency: 'USD'
        },
        status: 'published',
        createdBy: admin._id
      });
    }

    await Vintage.create(vintagesData);

    console.log('Created sample vintages');
    console.log('\nSeed data created successfully!');
    console.log('\nYou can now login with:');
    console.log('Email: admin@winehub.com');
    console.log('Password: admin123');
    console.log('\nDatabase contains:');
    console.log('- 10 Wineries');
    console.log('- 50 Wines (diverse types, regions, and awards)');
    console.log('- 30 Vintages (for first 15 wines)');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

connectDB().then(() => {
  seedData();
});
