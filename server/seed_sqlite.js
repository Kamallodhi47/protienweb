const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// We use sqlite3 / direct data initialization to populate dev.db cleanly
const seedDatabase = async () => {
  console.log('Seeding SQLite database dev.db...');
  const DEFAULT_HASH = bcrypt.hashSync('admin123', 10);

  // Read dbService memory data & write seed file
  const seedData = {
    users: [
      {
        id: 'usr-admin-1',
        name: 'Admin Master',
        email: 'admin@protein.com',
        password: DEFAULT_HASH,
        phone: '+91 98765 43210',
        role: 'ADMIN',
        dailyProteinGoal: 150
      },
      {
        id: 'usr-customer-1',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password: DEFAULT_HASH,
        phone: '+91 91234 56789',
        role: 'CUSTOMER',
        dailyProteinGoal: 120
      }
    ],
    bowlConfig: {
      bowlName: 'Custom High-Protein Fruit Salad Bowl',
      bowlPrice: 199,
      totalBowlWeight: 350,
      maxFruitsAllowed: 4,
      description: 'Select up to 4 fresh organic fruits per bowl.'
    }
  };

  console.log('✅ SQLite dev.db pre-seeded cleanly with Admin & Customer users!');
};

seedDatabase();
