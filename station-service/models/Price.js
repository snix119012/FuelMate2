const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Price = sequelize.define('Price', {
  price: { type: DataTypes.FLOAT, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'prices'
});

module.exports = Price;
