const express = require('express');
const Test = require('../models/Test');
const Patient = require('../models/patient');

const router = express.Router();

// Get all tests
router.get('/', async (req, res) => {
  try {
    const tests = await Test.findAll();
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single test by ID
router.get('/:id', async (req, res) => {
  try {
    const test = await Test.findByPk(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    res.json(test);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new test
router.post('/', async (req, res) => {
  const { type, date_taken, patientId } = req.body;
  try {
    const test = await Test.create({ type, date_taken, patientId });
    res.status(201).json(test);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a test
router.put('/:id', async (req, res) => {
  try {
    const test = await Test.findByPk(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    await test.update(req.body);
    res.json(test);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a test
router.delete('/:id', async (req, res) => {
  try {
    const test = await Test.findByPk(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    await test.destroy();
    res.json({ message: 'Test deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 