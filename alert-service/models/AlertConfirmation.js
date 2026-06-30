const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Model potwierdzenia alertu (tabela: alert_confirmations)
 *
 * Pozwala użytkownikom potwierdzać istnienie zgłoszonych zagrożeń.
 * Jeden alert może mieć wiele potwierdzeń od różnych użytkowników.
 */
const AlertConfirmation = sequelize.define('AlertConfirmation', {
  // Unikalny identyfikator potwierdzenia (UUID)
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // Identyfikator użytkownika, który potwierdził alert
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'alert_confirmations',
  timestamps: true
});

module.exports = AlertConfirmation;
