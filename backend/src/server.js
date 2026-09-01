require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const connectDB      = require('./config/db');
const seedDemoUsers  = require('./utils/seed');
const authRoutes     = require('./routes/authRoutes');
const bugRoutes      = require('./routes/bugRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

connectDB()
  .then(() => seedDemoUsers())
  .catch(err => console.error('MongoDB connection failed:', err.message));

app.get('/api/health', (req, res) => {
  res.json({ status: 'Bug Tracking System API running', port: PORT });
});

app.use('/api/auth', authRoutes);
app.use('/api/bugs', bugRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
