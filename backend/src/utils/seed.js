const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function seedDemoUsers() {
  const count = await User.countDocuments();
  if (count > 0) return;
  const hash = await bcrypt.hash('password123', 10);
  await User.insertMany([
    { username: 'tester_sarah', email: 'sarah@qut.edu.au', password: hash, role: 'Tester' },
    { username: 'dev_alex',     email: 'alex@qut.edu.au',  password: hash, role: 'Developer' },
    { username: 'qa_lead',      email: 'lead@qut.edu.au',  password: hash, role: 'QALead' },
  ]);
  console.log('Demo users seeded.');
}

module.exports = seedDemoUsers;
