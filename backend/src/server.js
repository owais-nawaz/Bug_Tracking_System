require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');

const app  = express();
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

app.use(cors());
app.use(express.json());

mongoose.connect(MONGO_URL)
  .then(() => console.log('MongoDB connected.'))
  .catch(() => console.warn('MongoDB unavailable — check MONGO_URL.'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'Bug Tracking System API running', port: PORT });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
