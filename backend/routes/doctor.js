const express = require('express');
const DoctorInbox = require('../models/DoctorInbox');
const Test = require('../models/Test');
const Patient = require('../models/patient');
const TestResult = require('../models/TestResult');

const router = express.Router();

// Get a doctor's inbox by email
router.get('/inbox', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'email query is required' });

    const items = await DoctorInbox.findAll({ where: { doctorEmail: email }, include: [{ model: Test }] });
    const testIds = items.map(i => i.testId);
    const tests = await Test.findAll({ where: { id: testIds } });
    const patientsMap = {};
    for (const t of tests) {
      if (!patientsMap[t.patientId]) {
        patientsMap[t.patientId] = await Patient.findByPk(t.patientId);
      }
    }
    const resultsMap = {};
    for (const t of tests) {
      resultsMap[t.id] = await TestResult.findAll({ where: { testId: t.id } });
    }

    const inbox = items.map(i => {
      const t = tests.find(tt => tt.id === i.testId);
      return {
        id: i.id,
        doctorEmail: i.doctorEmail,
        test: t,
        patient: patientsMap[t.patientId],
        results: resultsMap[t.id]
      };
    });

    res.json(inbox);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

