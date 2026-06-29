require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || './favorite-database.sqlite',
  logging: false
});

module.exports = sequelize;
