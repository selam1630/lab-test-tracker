const express = require('express');
const Patient = require('../models/patient');
const User = require('../models/User');

const router = express.Router();

// Get all patients (optionally filter by user)
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.findAll();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single patient by ID
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new patient
router.post('/', async (req, res) => {
  const { name, dob, gender, userId } = req.body;
  try {
    const patient = await Patient.create({ name, dob, gender, userId });
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a patient
router.put('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    await patient.update(req.body);
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a patient
router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    await patient.destroy();
    res.json({ message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;