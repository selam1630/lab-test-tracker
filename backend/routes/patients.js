const express = require('express');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Test = require('../models/Test');
const TestResult = require('../models/TestResult');
const nodemailer = require('nodemailer');

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
  const { name, dob, gender, userId, doctorEmail } = req.body;
  try {
    const patient = await Patient.create({ name, dob, gender, userId, doctorEmail });
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

// Send results to associated doctor
router.post('/:id/send-results', async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const doctorEmail = patient.doctorEmail || req.body.doctorEmail;
    if (!doctorEmail) {
      return res.status(400).json({ message: 'Doctor email not set for this patient' });
    }

    const tests = await Test.findAll({ where: { patientId: patient.id }, include: [{ model: TestResult }] });

    const htmlRows = tests.map(t => {
      const resultRows = (t.TestResults || []).map(r => `
        <tr>
          <td style="padding:4px 8px;border:1px solid #e5e7eb">${r.parameter_name}</td>
          <td style="padding:4px 8px;border:1px solid #e5e7eb">${r.value} ${r.unit}</td>
          <td style="padding:4px 8px;border:1px solid #e5e7eb">${r.normal_min}-${r.normal_max}</td>
        </tr>`).join('');
      return `
        <h3 style=\"margin:16px 0 8px\">${t.type} (${t.date_taken})</h3>
        <table cellspacing=\"0\" cellpadding=\"0\" style=\"border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:14px\">
          <thead>
            <tr>
              <th style=\"text-align:left;padding:6px 8px;border:1px solid #e5e7eb\">Parameter</th>
              <th style=\"text-align:left;padding:6px 8px;border:1px solid #e5e7eb\">Value</th>
              <th style=\"text-align:left;padding:6px 8px;border:1px solid #e5e7eb\">Normal Range</th>
            </tr>
          </thead>
          <tbody>
            ${resultRows || '<tr><td colspan=\"3\" style=\"padding:6px 8px;border:1px solid #e5e7eb;color:#6b7280\">No results</td></tr>'}
          </tbody>
        </table>`;
    }).join('');

    const html = `
      <div style=\"font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827\">
        <h2 style=\"margin:0 0 8px\">Lab Results: ${patient.name}</h2>
        <div style=\"margin-bottom:16px;color:#374151\">DOB: ${patient.dob} • Gender: ${patient.gender}</div>
        ${htmlRows || '<div>No tests found.</div>'}
      </div>`;

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
      subject: `Lab Results for ${patient.name}`,
      html
    });

    res.json({ message: 'Results sent to doctor' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send results' });
  }
});

module.exports = router;