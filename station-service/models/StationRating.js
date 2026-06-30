const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Model opinii o stacji (tabela: station_ratings)
 *
 * Przechowuje oceny i opcjonalne komentarze użytkowników
 * dotyczące konkretnej stacji (Station).
 */
const StationRating = sequelize.define('StationRating', {
  // Ocena w skali 1-5
  rating: { type: DataTypes.INTEGER, allowNull: false },
  // Opcjonalny komentarz tekstowy
  comment: { type: DataTypes.STRING },
  // Identyfikator użytkownika, który wystawił opinię
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'station_ratings'
});

module.exports = StationRating;
