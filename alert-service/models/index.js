const sequelize = require('../config/database');
const Alert = require('./Alert');
const AlertConfirmation = require('./AlertConfirmation');

Alert.hasMany(AlertConfirmation, { foreignKey: 'alertId', as: 'confirmations' });
AlertConfirmation.belongsTo(Alert, { foreignKey: 'alertId' });

module.exports = { sequelize, Alert, AlertConfirmation };