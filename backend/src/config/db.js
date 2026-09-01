const mongoose = require('mongoose');

async function connectDB() {
  const MONGO_URL = process.env.MONGO_URL;
  console.log('Connecting to MongoDB at:', MONGO_URL);
  await mongoose.connect(MONGO_URL);
  console.log('MongoDB connected.');
}

module.exports = connectDB;
