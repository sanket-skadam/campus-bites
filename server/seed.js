const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Inventory = require('./models/Inventory');
const WasteLog = require('./models/WasteLog');
const Feedback = require('./models/Feedback');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_canteen';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany();
    await MenuItem.deleteMany();
    await Inventory.deleteMany();
    await WasteLog.deleteMany();
    await Feedback.deleteMany();

    console.log('[Seed] Cleared existing data.');

    // 1. Seed Users (let pre-save hook hash the password)
    const users = await User.create([
      {
        name: 'Alex Morgan',
        email: 'student@canteen.edu',
        campusId: 'STU-1082',
        password: 'password123',
        role: 'student',
        department: 'Computer Engineering'
      },
      {
        name: 'Prof. Sharma',
        email: 'staff@canteen.edu',
        campusId: 'CS-8812',
        password: 'password123',
        role: 'college_staff',
        department: 'Information Technology'
      },
      {
        name: 'Chef Ramesh',
        email: 'canteen@canteen.edu',
        campusId: 'CANTEEN-01',
        password: 'password123',
        role: 'canteen_staff',
        department: 'Food & Beverage Operations'
      }
    ]);
    console.log('[Seed] Seeded 3 Users (Student, College Staff, Canteen Staff). Password: password123');

    // 2. Seed Menu Items (with Authentic Real Food Photography & Recipe Ingredients)
    const menuItems = await MenuItem.create([
      {
        name: 'Veg Sandwich',
        description: 'Crisp toasted multigrain bread loaded with fresh cucumber, tomato, lettuce & green chutney',
        price: 40,
        category: 'Snacks',
        icon: '🥪',
        image: '/dishes/sandwich.jpg',
        isAvailable: true,
        prepTimeMinutes: 5,
        ingredients: [
          { ingredientName: 'Bread', quantityNeeded: 1, unit: 'packs' },
          { ingredientName: 'Tomato', quantityNeeded: 0.1, unit: 'kg' }
        ]
      },
      {
        name: 'Masala Dosa',
        description: 'Crispy golden fermented crepe stuffed with spiced mashed potatoes, served with sambar & coconut chutney',
        price: 55,
        category: 'Breakfast',
        icon: '🥞',
        image: '/dishes/dosa.jpg',
        isAvailable: true,
        prepTimeMinutes: 10,
        ingredients: [
          { ingredientName: 'Rice', quantityNeeded: 0.15, unit: 'kg' }
        ]
      },
      {
        name: 'Veg Thali',
        description: 'Homestyle balanced meal with 2 rotis, seasonal subzi, tadka dal, steamed basmati rice & salad',
        price: 80,
        category: 'Meals & Thali',
        icon: '🍛',
        image: '/dishes/thali.jpg',
        isAvailable: true,
        prepTimeMinutes: 5,
        ingredients: [
          { ingredientName: 'Rice', quantityNeeded: 0.2, unit: 'kg' },
          { ingredientName: 'Tomato', quantityNeeded: 0.1, unit: 'kg' }
        ]
      },
      {
        name: 'Paneer Rice Bowl',
        description: 'Aromatic jeera rice topped with tender cottage cheese cooked in mild spiced tomato onion gravy',
        price: 90,
        category: 'Meals & Thali',
        icon: '🍱',
        image: '/dishes/paneer.jpg',
        isAvailable: true,
        prepTimeMinutes: 8,
        ingredients: [
          { ingredientName: 'Rice', quantityNeeded: 0.2, unit: 'kg' },
          { ingredientName: 'Paneer', quantityNeeded: 0.15, unit: 'kg' }
        ]
      },
      {
        name: 'Fresh Salad Combo',
        description: 'Wholesome bowl of crisp lettuce, cherry tomatoes, cucumbers, carrots tossed in lemon vinaigrette',
        price: 65,
        category: 'Snacks',
        icon: '🥗',
        image: '/dishes/salad.jpg',
        isAvailable: true,
        prepTimeMinutes: 5,
        ingredients: [
          { ingredientName: 'Tomato', quantityNeeded: 0.15, unit: 'kg' }
        ]
      },
      {
        name: 'Gulab Jamun (2 pcs)',
        description: 'Traditional fried khoya dumplings soaked in fragrant cardamom and saffron infused warm sugar syrup',
        price: 35,
        category: 'Dessert',
        icon: '🧁',
        image: '/dishes/gulab_jamun.jpg',
        isAvailable: true,
        prepTimeMinutes: 2,
        ingredients: []
      },
      {
        name: 'Crispy Samosa (2 pcs)',
        description: 'Golden flaky pastry filled with spiced potatoes, green peas and crushed coriander seeds',
        price: 30,
        category: 'Snacks',
        icon: '🥟',
        image: '/dishes/samosa.jpg',
        isAvailable: true,
        prepTimeMinutes: 3,
        ingredients: []
      },
      {
        name: 'Filter Coffee',
        description: 'Authentic South Indian chicory blend coffee brewed strong with frothy whole milk',
        price: 25,
        category: 'Beverages',
        icon: '☕',
        image: '/dishes/coffee.jpg',
        isAvailable: true,
        prepTimeMinutes: 4,
        ingredients: []
      }
    ]);
    console.log('[Seed] Seeded 7 Menu Items.');

    // 3. Seed Inventory
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    await Inventory.create([
      {
        name: 'Tomato',
        currentStock: 22,
        unit: 'kg',
        reorderThreshold: 15,
        expiryDate: tomorrow,
        status: 'Stable'
      },
      {
        name: 'Bread',
        currentStock: 15,
        unit: 'packs',
        reorderThreshold: 10,
        expiryDate: nextWeek,
        status: 'Stable'
      },
      {
        name: 'Rice',
        currentStock: 8,
        unit: 'kg',
        reorderThreshold: 20,
        expiryDate: nextWeek,
        status: 'Low stock'
      },
      {
        name: 'Paneer',
        currentStock: 18,
        unit: 'kg',
        reorderThreshold: 15,
        expiryDate: tomorrow,
        status: 'Reorder soon'
      }
    ]);
    console.log('[Seed] Seeded 4 Inventory Items.');

    // 4. Seed Waste Log
    await WasteLog.create([
      {
        item: 'Veg Sandwich',
        quantityKg: 1.5,
        reason: 'Over-preparation',
        disposalMethod: 'Composting',
        staffName: 'Chef Ramesh',
        loggedBy: users[2]._id
      },
      {
        item: 'Masala Dosa',
        quantityKg: 2.0,
        reason: 'Damaged / spoiled',
        disposalMethod: 'Biowaste collection',
        staffName: 'Chef Ramesh',
        loggedBy: users[2]._id
      },
      {
        item: 'Rice',
        quantityKg: 4.0,
        reason: 'Customer leftovers',
        disposalMethod: 'Composting',
        staffName: 'Chef Ramesh',
        loggedBy: users[2]._id
      }
    ]);
    console.log('[Seed] Seeded 3 Waste Log Entries.');

    // 5. Seed Feedback
    await Feedback.create([
      {
        user: users[0]._id,
        userName: 'Alex Morgan',
        orderNumber: '#SC1022',
        itemReviewed: 'Masala Dosa',
        rating: 5,
        category: 'Food Quality',
        comment: 'Crispy and piping hot! The pre-order saved me at least 15 minutes of standing in line.'
      },
      {
        user: users[1]._id,
        userName: 'Prof. Sharma',
        orderNumber: '#SC1023',
        itemReviewed: 'Veg Thali',
        rating: 4,
        category: 'Service Speed',
        comment: 'Pickup was right on time at 12:15 PM slot. Very clean packaging.'
      }
    ]);
    console.log('[Seed] Seeded 2 Feedback Reviews.');

    console.log('\n[Seed Success] Database populated successfully! Press Ctrl+C or let script exit.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error.message);
    process.exit(1);
  }
};

seedData();

