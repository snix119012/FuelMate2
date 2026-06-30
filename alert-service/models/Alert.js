const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Model alertu drogowego (tabela: alerts)
 *
 * Reprezentuje zgłoszone przez użytkowników zagrożenia drogowe
 * takie jak patrol, fotoradar, wypadek, kontrola czy kamera.
 * Alert ma określoną lokalizację geograficzną oraz czas wygaśnięcia.
 */
const Alert = sequelize.define('Alert', {
  // Unikalny identyfikator alertu (UUID)
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // Identyfikator użytkownika, który dodał alert
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Rodzaj zagrożenia drogowego
  type: {
    type: DataTypes.ENUM('patrol', 'fotoradar', 'wypadek', 'kontrola', 'kamera'),
    allowNull: false,
  },
  // Szerokość geograficzna miejsca zdarzenia
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  // Długość geograficzna miejsca zdarzenia
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  // Data i czas wygaśnięcia alertu (po tym czasie alert nie jest już aktywny)
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  }
}, {
  tableName: 'alerts',
  timestamps: true
});

module.exports = Alert;
