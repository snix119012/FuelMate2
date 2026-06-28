require('dotenv').config();
const sequelize = require('./db');
const { Station, FuelType } = require('./models');

async function seed() {
  try {
    await sequelize.sync({ force: true });
    
    await FuelType.bulkCreate([
      { name: 'PB95' },
      { name: 'PB98' },
      { name: 'ON' },
      { name: 'LPG' },
      { name: 'EV' }
    ]);
    
    await Station.bulkCreate([
      {
        name: 'Orlen',
        brand: 'Orlen',
        address: 'ul. Przykładowa 1, Warszawa',
        lat: 52.2297,
        lng: 21.0122
      },
      {
        name: 'BP',
        brand: 'BP',
        address: 'ul. Testowa 2, Warszawa',
        lat: 52.2300,
        lng: 21.0150
      }
    ]);
    
    console.log('Baza danych została zainicjalizowana pomyślnie.');
  } catch (error) {
    console.error('Błąd podczas inicjalizacji bazy danych:', error);
  } finally {
    process.exit();
  }
}

seed();
