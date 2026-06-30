const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Model typu paliwa (tabela: fuel_types)
 *
 * Słownik dostępnych rodzajów paliw: PB95, PB98, ON, LPG, EV.
 * Każdy typ paliwa może występować w wielch cenach (Price).
 */
const FuelType = sequelize.define('FuelType', {
  // Nazwa typu paliwa, unikalna w całej tabeli
  name: { type: DataTypes.STRING, allowNull: false, unique: true }
}, {
  tableName: 'fuel_types',
  timestamps: false
});

module.exports = FuelType;
