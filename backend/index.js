const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./models');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const Patient = require('./models/patient');
const Test = require('./models/Test');
const TestResult = require('./models/TestResult');
const patientRoutes = require('./routes/patients');
const testRoutes = require('./routes/tests');
const testResultRoutes = require('./routes/testResults');
const doctorRoutes = require('./routes/doctor');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/test-results', testResultRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express backend!' });
});

const PORT = process.env.PORT || 5000;
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});