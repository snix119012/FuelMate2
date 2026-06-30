require('dotenv').config({ path: require('path').join(__dirname, '.env') });
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
      // WARSZAWA
      { name: 'Orlen', brand: 'Orlen', address: 'ul. Wawelska 5, Warszawa', lat: 52.2173, lng: 20.9856 },
      { name: 'BP Puławska', brand: 'BP', address: 'ul. Puławska 417, Warszawa', lat: 52.1465, lng: 20.9998 },
      { name: 'Shell', brand: 'Shell', address: 'ul. Ostrobramska 95, Warszawa', lat: 52.2356, lng: 21.1012 },
      { name: 'Circle K', brand: 'Circle K', address: 'al. KEN 14, Warszawa', lat: 52.1354, lng: 21.0655 },
      { name: 'Moya', brand: 'Moya', address: 'ul. Wolska 153, Warszawa', lat: 52.2312, lng: 20.9412 },
      { name: 'Amic Energy', brand: 'Amic', address: 'ul. Radzymińska 160, Warszawa', lat: 52.2741, lng: 21.0664 },
      { name: 'Orlen', brand: 'Orlen', address: 'ul. Powązkowska 40, Warszawa', lat: 52.2598, lng: 20.9654 },
      { name: 'BP Jerozolimskie', brand: 'BP', address: 'al. Jerozolimskie 144, Warszawa', lat: 52.2144, lng: 20.9632 },
      { name: 'Shell Solidarności', brand: 'Shell', address: 'al. Solidarności 100, Warszawa', lat: 52.2422, lng: 20.9854 },
      { name: 'Circle K', brand: 'Circle K', address: 'ul. Czerniakowska 85, Warszawa', lat: 52.2033, lng: 21.0456 },
      
      // KRAKÓW
      { name: 'Orlen 29 Listopada', brand: 'Orlen', address: 'al. 29 Listopada 162, Kraków', lat: 50.0987, lng: 19.9543 },
      { name: 'BP Opolska', brand: 'BP', address: 'ul. Opolska 12, Kraków', lat: 50.0911, lng: 19.9322 },
      { name: 'Shell Bratysławska', brand: 'Shell', address: 'ul. Bratysławska 3, Kraków', lat: 50.0864, lng: 19.9298 },
      { name: 'Circle K Kapelanka', brand: 'Circle K', address: 'ul. Kapelanka 54, Kraków', lat: 50.0345, lng: 19.9222 },
      { name: 'Moya Półłanki', brand: 'Moya', address: 'ul. Półłanki 80, Kraków', lat: 50.0311, lng: 20.0345 },
      { name: 'Amic Zakopiańska', brand: 'Amic', address: 'ul. Zakopiańska 62, Kraków', lat: 50.0155, lng: 19.9291 },
      { name: 'Orlen Stella-Sawickiego', brand: 'Orlen', address: 'ul. Stella-Sawickiego 1, Kraków', lat: 50.0766, lng: 19.9922 },
      { name: 'BP Jasnogórska', brand: 'BP', address: 'ul. Jasnogórska 2, Kraków', lat: 50.0912, lng: 19.8976 },
      { name: 'Shell Nowohucka', brand: 'Shell', address: 'ul. Nowohucka 71, Kraków', lat: 50.0522, lng: 19.9987 },
      { name: 'Circle K Wielicka', brand: 'Circle K', address: 'ul. Wielicka 75, Kraków', lat: 50.0334, lng: 19.9655 }
    ]);
    
    console.log('Baza danych została zainicjalizowana pomyślnie.');
  } catch (error) {
    console.error('Błąd podczas inicjalizacji bazy danych:', error);
  } finally {
    process.exit();
  }
}

seed();
