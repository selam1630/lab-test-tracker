const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const User = require('./User');

const Patient = sequelize.define('Patient', {
  name: { type: DataTypes.STRING, allowNull: false },
  dob: { type: DataTypes.DATEONLY, allowNull: false },
  gender: { type: DataTypes.STRING, allowNull: false }
});

User.hasMany(Patient, { foreignKey: 'userId' });
Patient.belongsTo(User, { foreignKey: 'userId' });

module.exports = Patient;