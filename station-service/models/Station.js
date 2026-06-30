const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Model stacji benzynowej (tabela: stations)
 *
 * Reprezentuje pojedynczą stację paliw na mapie.
 * Stacja może mieć wiele cen (Price) oraz opinii (StationRating).
 */
const Station = sequelize.define('Station', {
  // Nazwa wyświetlana stacji, np. "Orlen Wawelska"
  name: { type: DataTypes.STRING, allowNull: false },
  // Marka sieci stacji, np. Orlen, BP, Shell
  brand: { type: DataTypes.STRING },
  // Pełny adres stacji
  address: { type: DataTypes.STRING },
  // Szerokość geograficzna (do wyświetlania na mapie)
  lat: { type: DataTypes.FLOAT, allowNull: false },
  // Długość geograficzna (do wyświetlania na mapie)
  lng: { type: DataTypes.FLOAT, allowNull: false },
  // Średnia ocena użytkowników (przeliczana automatycznie po dodaniu opinii)
  averageRating: { type: DataTypes.FLOAT, defaultValue: 0 },
  // Liczba wystawionych opinii
  ratingCount: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'stations'
});

module.exports = Station;
