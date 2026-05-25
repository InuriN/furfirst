const express = require('express');
const Slot = require('../models/Slot');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const slots = await Slot.find({ isAvailable: true });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access is denied' });
    }
    const { date, time, vetName } = req.body;
    const slot = new Slot({ date, time, vetName });
    await slot.save();
    res.status(201).json({ message: 'Slot created', slot });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;