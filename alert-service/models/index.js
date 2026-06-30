const sequelize = require('../config/database');
const Alert = require('./Alert');
const AlertConfirmation = require('./AlertConfirmation');

/**
 * Relacje między tabelami w alert-service:
 *
 * - Alert 1:N AlertConfirmation (jeden alert może mieć wiele potwierdzeń)
 */
Alert.hasMany(AlertConfirmation, { foreignKey: 'alertId', as: 'confirmations' });
AlertConfirmation.belongsTo(Alert, { foreignKey: 'alertId' });

module.exports = { sequelize, Alert, AlertConfirmation };
