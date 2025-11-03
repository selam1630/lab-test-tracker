const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Test = require('./Test');

const DoctorInbox = sequelize.define('DoctorInbox', {
  doctorEmail: { type: DataTypes.STRING, allowNull: false }
});

Test.hasMany(DoctorInbox, { foreignKey: 'testId' });
DoctorInbox.belongsTo(Test, { foreignKey: 'testId' });

module.exports = DoctorInbox;

