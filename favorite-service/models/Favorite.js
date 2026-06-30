const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Model ulubionej stacji (tabela: favorites)
 *
 * Przechowuje stacje dodane przez użytkowników do listy ulubionych.
 * Pozwala na szybki dostęp do często odwiedzanych stacji oraz
 * włączanie powiadomień o zmianach cen.
 */
const Favorite = sequelize.define('Favorite', {
  // Identyfikator użytkownika, który dodał stację do ulubionych
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Identyfikator stacji w station-service
  stationId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Nazwa stacji zapamiętana w ulubionych
  stationName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Flaga określająca, czy użytkownik chce otrzymywać powiadomienia o zmianach cen
  notifyOnPriceChange: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'favorites'
});

module.exports = Favorite;
