const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');

// Get all deliveries
router.get('/', async (req, res) => {
  try {
    const deliveries = await Delivery.find();
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new delivery
router.post('/', async (req, res) => {
  const delivery = new Delivery(req.body);
  try {
    const newDelivery = await delivery.save();
    res.status(201).json(newDelivery);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update delivery status
router.put('/:id', async (req, res) => {
  try {
    const updated = await Delivery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete delivery
router.delete('/:id', async (req, res) => {
  try {
    await Delivery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Delivery deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;