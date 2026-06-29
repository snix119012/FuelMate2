const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AlertConfirmation = sequelize.define('AlertConfirmation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'alert_confirmations',
  timestamps: true
});

module.exports = AlertConfirmation;