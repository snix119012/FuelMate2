const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  postalCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false 
  }
}, {
  tableName: 'users' 
});

module.exports = User;
