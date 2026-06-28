const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Station = sequelize.define('Station', {
  name: { type: DataTypes.STRING, allowNull: false },
  brand: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
  lat: { type: DataTypes.FLOAT, allowNull: false },
  lng: { type: DataTypes.FLOAT, allowNull: false },
  averageRating: { type: DataTypes.FLOAT, defaultValue: 0 },
  ratingCount: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'stations'
});

module.exports = Station;
