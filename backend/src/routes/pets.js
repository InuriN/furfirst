const express = require('express');
const Pet = require('../models/Pet');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user.id });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, species, breed, age, weight, notes } = req.body;
    const pet = new Pet({
      owner: req.user.id,
      name,
      species,
      breed,
      age,
      weight,
      notes
    });
    await pet.save();
    res.status(201).json({ message: 'Pet added successfully', pet });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.user.id });
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    const updated = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Pet updated successfully', pet: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.user.id });
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    await Pet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;