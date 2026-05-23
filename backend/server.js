const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const vehicleRoutes = require('./routes/vehicles');
const deliveryRoutes = require('./routes/deliveries');
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/deliveries', deliveryRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  family: 4
})
  .then(() => {
    console.log('MongoDB Connected!');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.log('MongoDB Error:', err.message));