const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Model ceny paliwa (tabela: prices)
 *
 * Przechowuje zgłoszone przez użytkowników ceny dla konkretnej
 * stacji (Station) i typu paliwa (FuelType).
 */
const Price = sequelize.define('Price', {
  // Wartość ceny (PLN)
  price: { type: DataTypes.FLOAT, allowNull: false },
  // Identyfikator użytkownika, który zgłosił cenę
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'prices'
});

module.exports = Price;
