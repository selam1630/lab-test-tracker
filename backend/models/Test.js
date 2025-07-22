const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Patient = require('./patient');

const Test = sequelize.define('Test', {
  type: { type: DataTypes.STRING, allowNull: false },
  date_taken: { type: DataTypes.DATEONLY, allowNull: false }
});

Patient.hasMany(Test, { foreignKey: 'patientId' });
Test.belongsTo(Patient, { foreignKey: 'patientId' });

module.exports = Test;