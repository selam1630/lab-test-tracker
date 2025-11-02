const sequelize = require('./models');
const User = require('./models/User');
const Patient = require('./models/patient');
const Test = require('./models/Test');
const TestResult = require('./models/TestResult');

async function viewDatabase() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful!\n');
    
    // Get all users
    console.log('👥 USERS:');
    console.log('='.repeat(50));
    const users = await User.findAll({ attributes: ['id', 'name', 'email'] });
    if (users.length === 0) {
      console.log('No users found.\n');
    } else {
      users.forEach(u => {
        console.log(`ID: ${u.id} | Name: ${u.name} | Email: ${u.email}`);
      });
      console.log();
    }
    
    // Get all patients
    console.log('🏥 PATIENTS:');
    console.log('='.repeat(50));
    const patients = await Patient.findAll();
    if (patients.length === 0) {
      console.log('No patients found.\n');
    } else {
      patients.forEach(p => {
        console.log(`ID: ${p.id} | Name: ${p.name} | DOB: ${p.dob} | Gender: ${p.gender} | UserID: ${p.userId}`);
      });
      console.log();
    }
    
    // Get all tests
    console.log('🧪 TESTS:');
    console.log('='.repeat(50));
    const tests = await Test.findAll();
    if (tests.length === 0) {
      console.log('No tests found.\n');
    } else {
      tests.forEach(t => {
        console.log(`ID: ${t.id} | Type: ${t.type} | Date: ${t.date_taken} | PatientID: ${t.patientId}`);
      });
      console.log();
    }
    
    // Get all test results
    console.log('📊 TEST RESULTS:');
    console.log('='.repeat(50));
    const results = await TestResult.findAll();
    if (results.length === 0) {
      console.log('No test results found.\n');
    } else {
      results.forEach(r => {
        console.log(`ID: ${r.id} | Parameter: ${r.parameter_name} | Value: ${r.value} ${r.unit} | Normal: ${r.normal_min}-${r.normal_max} | TestID: ${r.testId}`);
      });
      console.log();
    }
    
    // Show table structure
    console.log('📋 DATABASE STATISTICS:');
    console.log('='.repeat(50));
    const [tableInfo] = await sequelize.query(`
      SELECT 
        TABLE_NAME as 'Table',
        TABLE_ROWS as 'Rows',
        DATA_LENGTH as 'Size (bytes)'
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'lab_test_tracker'
      ORDER BY TABLE_NAME;
    `);
    
    console.table(tableInfo);
    
    await sequelize.close();
    console.log('\n✅ Database connection closed.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

viewDatabase();

