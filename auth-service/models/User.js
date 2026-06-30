const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Model użytkownika (tabela: users)
 *
 * Przechowuje dane kont użytkowników systemu FuelMate.
 * Używany przez auth-service do logowania, rejestracji oraz
 * zarządzania punktami lojalnościowymi.
 */
const User = sequelize.define('User', {
  // Adres e-mail użytkownika, jednocześnie unikalny identyfikator logowania
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  // Zahashowane hasło (bcrypt)
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Imię użytkownika (opcjonalne)
  firstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Nazwisko użytkownika (opcjonalne)
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Miasto użytkownika (opcjonalne)
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Kod pocztowy użytkownika (opcjonalny)
  postalCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Punkty lojalnościowe zdobyte za aktywność w aplikacji
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Flaga administratora
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'users'
});

module.exports = User;
