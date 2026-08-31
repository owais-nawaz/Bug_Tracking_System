require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User   = require('./models/User');
const Bug    = require('./models/Bug');


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

// Role authorization middleware — rejects unauthorized API calls
function requireRole(allowedRoles) {
  return (req, res, next) => {
    const role     = req.headers['x-user-role'];
    const username = req.headers['x-user-name'];
    if (!role) return res.status(401).json({ success: false, errors: ['Authentication required.'] });
    if (!allowedRoles.includes(role))
      return res.status(403).json({ success: false, errors: [`Role "${role}" is not authorised for this action.`] });
    req.authenticatedUser = { username: username || 'Anonymous', role };
    next();
  };
}


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

// POST /api/bugs — Tester or QA Lead submits a bug report
app.post('/api/bugs', requireRole(['Tester', 'QALead']), async (req, res) => {
  const { title, module, severity, priority, description } = req.body;
  const reporter = req.authenticatedUser.username;

  const errors = [];
  if (!title || title.trim().length < 5)   errors.push('Title must be at least 5 characters.');
  if (!module || module.trim() === '')      errors.push('Module is required.');
  if (!description || description.trim().length < 10) errors.push('Description must be at least 10 characters.');
  if (!['Low','Medium','High','Critical'].includes(severity)) errors.push('Valid severity is required.');
  if (!['Low','Medium','High','Critical'].includes(priority)) errors.push('Valid priority is required.');
  if (errors.length) return res.status(400).json({ success: false, errors });

  const lastBug = await Bug.findOne().sort({ ticketId: -1 });
  const ticketId = lastBug ? lastBug.ticketId + 1 : 101;

  const newBug = await Bug.create({
    ticketId, title: title.trim(), module: module.trim(),
    severity, priority, description: description.trim(),
    status: 'Open', reporter, assignee: 'Unassigned'
  });

  res.status(201).json({ success: true, message: `BUG-${ticketId} created.`,
    bug: { ...newBug.toObject(), id: ticketId } });
});

// GET /api/bugs — retrieve and filter all bug tickets
app.get('/api/bugs', async (req, res) => {
  const { status, priority, search } = req.query;
  let query = {};
  if (status && status !== 'All')     query.status   = new RegExp(`^${status}$`, 'i');
  if (priority && priority !== 'All') query.priority = new RegExp(`^${priority}$`, 'i');
  if (search) query.$or = [
    { title:       { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
  ];
  const bugs = await Bug.find(query).sort({ updatedAt: -1 });
  res.json({ success: true, count: bugs.length, bugs: bugs.map(b => ({ ...b.toObject(), id: b.ticketId })) });
});


// PATCH /api/bugs/:id/claim — Developer claims an open ticket
app.patch('/api/bugs/:id/claim', requireRole(['Developer']), async (req, res) => {
  const bugId    = parseInt(req.params.id, 10);
  const assignee = req.authenticatedUser.username;
  const updated  = await Bug.findOneAndUpdate(
    { ticketId: bugId },
    { assignee, status: 'In Progress' },
    { new: true }
  );
  if (!updated) return res.status(404).json({ success: false, errors: ['Ticket not found.'] });
  res.json({ success: true, message: `BUG-${bugId} claimed by ${assignee}.`,
    bug: { ...updated.toObject(), id: updated.ticketId } });
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
