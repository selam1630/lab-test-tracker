const express = require('express');
const Test = require('../models/Test');
const Patient = require('../models/Patient');
const TestResult = require('../models/TestResult');
const nodemailer = require('nodemailer');
const DoctorInbox = require('../models/DoctorInbox');

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

// Send this test's results to the associated doctor's email
router.post('/:id/send-to-doctor', async (req, res) => {
  try {
    const test = await Test.findByPk(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    if (!test.patientId) return res.status(400).json({ message: 'Test has no associated patient' });
    const patient = await Patient.findByPk(test.patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const doctorEmail = (patient && patient.doctorEmail) || (req.body && req.body.doctorEmail);
    if (!doctorEmail) return res.status(400).json({ message: 'Doctor email not set for this patient' });

    const results = await TestResult.findAll({ where: { testId: test.id } });
    const rows = results.map(r => `
      <tr>
        <td style="padding:4px 8px;border:1px solid #e5e7eb">${r.parameter_name}</td>
        <td style="padding:4px 8px;border:1px solid #e5e7eb">${r.value} ${r.unit}</td>
        <td style="padding:4px 8px;border:1px solid #e5e7eb">${r.normal_min}-${r.normal_max}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827">
        <h2 style="margin:0 0 8px">Lab Result for ${patient.name}</h2>
        <div style="margin-bottom:12px;color:#374151">Test: ${test.type} • Date: ${test.date_taken}</div>
        <table cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:14px">
          <thead>
            <tr>
              <th style="text-align:left;padding:6px 8px;border:1px solid #e5e7eb">Parameter</th>
              <th style="text-align:left;padding:6px 8px;border:1px solid #e5e7eb">Value</th>
              <th style="text-align:left;padding:6px 8px;border:1px solid #e5e7eb">Normal Range</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="3" style="padding:6px 8px;border:1px solid #e5e7eb;color:#6b7280">No results</td></tr>'}
          </tbody>
        </table>
      </div>
    `;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'no-reply@labtracker.local',
      to: doctorEmail,
      subject: `Lab Result: ${patient.name} - ${test.type}`,
      html
    });

    res.json({ message: 'Test result sent to doctor' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send test result' });
  }
});

// Assign this test to a doctor's inbox
router.post('/:id/assign-to-doctor', async (req, res) => {
  try {
    const test = await Test.findByPk(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    if (!test.patientId) return res.status(400).json({ message: 'Test has no associated patient' });
    const patient = await Patient.findByPk(test.patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const doctorEmail = (req.body && req.body.doctorEmail) || (patient && patient.doctorEmail);
    if (!doctorEmail) return res.status(400).json({ message: 'Doctor email not set for this patient' });

    const record = await DoctorInbox.create({ doctorEmail, testId: test.id });
    res.json({ message: 'Assigned to doctor inbox', id: record.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to assign to doctor inbox' });
  }
});

module.exports = router; 