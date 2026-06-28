const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const FuelType = sequelize.define('FuelType', {
  name: { type: DataTypes.STRING, allowNull: false, unique: true }
}, {
  tableName: 'fuel_types',
  timestamps: false
});

module.exports = FuelType;
