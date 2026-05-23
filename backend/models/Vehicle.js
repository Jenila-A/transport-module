const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true,
    unique: true
  },
  driverName: {
    type: String,
    required: true
  },
  driverPhone: {
    type: String,
    required: true
  },
  vehicleType: {
    type: String,
    enum: ['Truck', 'Van', 'Bike', 'Car'],
    default: 'Truck'
  },
  status: {
    type: String,
    enum: ['Available', 'On Trip', 'Under Maintenance'],
    default: 'Available'
  }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);