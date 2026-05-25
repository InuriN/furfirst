const express = require('express');
const Appointment = require('../models/Appointment');
const Slot = require('../models/Slot');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    let appointments;
    if (req.user.role === 'admin') {
      appointments = await Appointment.find()
        .populate('owner', 'name email')
        .populate('pet', 'name species')
        .populate('slot', 'date time vetName');
    } else {
      appointments = await Appointment.find({ owner: req.user.id })
        .populate('pet', 'name species')
        .populate('slot', 'date time vetName');
    }
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { petId, slotId, reason, notes } = req.body;

    const slot = await Slot.findById(slotId);
    if (!slot || !slot.isAvailable) {
      return res.status(400).json({ message: 'Slot not available' });
    }

    const appointment = new Appointment({
      owner: req.user.id,
      pet: petId,
      slot: slotId,
      reason,
      notes
    });

    await appointment.save();

    slot.isAvailable = false;
    await slot.save();

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (req.user.role !== 'admin' && appointment.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access is denied' });
    }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ message: 'Appointment updated', appointment: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access is denied' });
    }

    await Slot.findByIdAndUpdate(appointment.slot, { isAvailable: true });
    await Appointment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;