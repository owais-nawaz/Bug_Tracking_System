require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User   = require('./models/User');

const app  = express();
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

app.use(cors());
app.use(express.json());

console.log('Connecting to MongoDB at:', MONGO_URL);
mongoose.connect(MONGO_URL)
  .then(async () => {
    console.log('MongoDB connected.');
    await seedDemoUsers();
  })
  .catch((err) => console.error('MongoDB connection failed:', err.message));

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'Bug Tracking System API running', port: PORT });
});

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const errors = [];
    if (!username || username.trim().length < 3) errors.push('Username must be at least 3 characters.');
    if (!email || !email.includes('@'))          errors.push('Valid email is required.');
    if (!password || password.length < 4)        errors.push('Password must be at least 4 characters.');
    if (errors.length) return res.status(400).json({ success: false, errors });

    const existing = await User.findOne({ $or: [{ username: username.trim() }, { email: email.toLowerCase() }] });
    if (existing) return res.status(400).json({ success: false, errors: ['Username or email already registered.'] });

    const hashed   = await bcrypt.hash(password, 10);
    const userRole = ['Tester','Developer','QALead'].includes(role) ? role : 'Tester';
    const user     = await User.create({ username: username.trim(), email: email.toLowerCase(), password: hashed, role: userRole });

    res.status(201).json({ success: true, message: `Account created for ${user.username}.`,
      user: { username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ success: false, errors: ['Server error — check MongoDB connection.'] });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, errors: ['Username and password are required.'] });

    const user = await User.findOne({ username: username.trim() });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ success: false, errors: ['Invalid username or password.'] });

    res.json({ success: true, message: `Welcome back, ${user.username}!`,
      user: { username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, errors: ['Server error — check MongoDB connection.'] });
  }
});



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
