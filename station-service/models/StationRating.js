const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const StationRating = sequelize.define('StationRating', {
  rating: { type: DataTypes.INTEGER, allowNull: false },
  comment: { type: DataTypes.STRING },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'station_ratings'
});

module.exports = StationRating;
