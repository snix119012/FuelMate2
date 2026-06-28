const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Favorite = sequelize.define('Favorite', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stationId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stationName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notifyOnPriceChange: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'favorites',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'stationId']
    }
  ]
});

module.exports = Favorite;
