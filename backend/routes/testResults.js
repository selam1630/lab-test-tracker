const express = require('express');
const TestResult = require('../models/TestResult');
const Test = require('../models/Test');

const router = express.Router();

// Get all test results
router.get('/', async (req, res) => {
  try {
    const results = await TestResult.findAll();
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single test result by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await TestResult.findByPk(req.params.id);
    if (!result) return res.status(404).json({ message: 'Test result not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new test result
router.post('/', async (req, res) => {
  const { parameter_name, value, unit, normal_min, normal_max, testId } = req.body;
  try {
    const result = await TestResult.create({ parameter_name, value, unit, normal_min, normal_max, testId });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a test result
router.put('/:id', async (req, res) => {
  try {
    const result = await TestResult.findByPk(req.params.id);
    if (!result) return res.status(404).json({ message: 'Test result not found' });
    await result.update(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a test result
router.delete('/:id', async (req, res) => {
  try {
    const result = await TestResult.findByPk(req.params.id);
    if (!result) return res.status(404).json({ message: 'Test result not found' });
    await result.destroy();
    res.json({ message: 'Test result deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 