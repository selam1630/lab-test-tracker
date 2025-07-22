const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Test = require('./Test');

const TestResult = sequelize.define('TestResult', {
  parameter_name: { type: DataTypes.STRING, allowNull: false },
  value: { type: DataTypes.FLOAT, allowNull: false },
  unit: { type: DataTypes.STRING, allowNull: false },
  normal_min: { type: DataTypes.FLOAT, allowNull: false },
  normal_max: { type: DataTypes.FLOAT, allowNull: false }
});

Test.hasMany(TestResult, { foreignKey: 'testId' });
TestResult.belongsTo(Test, { foreignKey: 'testId' });

module.exports = TestResult;