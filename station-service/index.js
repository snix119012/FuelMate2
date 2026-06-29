require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const { Station, FuelType, Price, StationRating } = require('./models');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

const { getDistanceFromLatLonInKm } = require('./utils/haversine');

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'station-service', port: PORT });
});

app.get('/stations', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const rad = parseFloat(radius) || 10; // domyślny promień to 10 km

    const stations = await Station.findAll({
      include: [
        {
          model: Price,
          include: [FuelType]
        }
      ]
    });
    
    let result = stations.map(station => {
      const plainStation = station.get({ plain: true });
      const latestPrices = {};
      
      if (plainStation.Prices && plainStation.Prices.length > 0) {
        // Sortowanie malejąco po dacie dodania, aby uzyskać najnowsze ceny jako pierwsze
        const sortedPrices = plainStation.Prices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        for (const price of sortedPrices) {
          if (price.FuelType) {
            const fuelName = price.FuelType.name;
            if (!latestPrices[fuelName]) {
              latestPrices[fuelName] = {
                id: price.id,
                price: price.price,
                reportedAt: price.createdAt
              };
            }
          }
        }
      }
      
      plainStation.prices = latestPrices;
      delete plainStation.Prices;
      
      // Obliczanie odległości jeśli dostarczono koordynaty
      if (!isNaN(userLat) && !isNaN(userLng)) {
        plainStation.distance = getDistanceFromLatLonInKm(userLat, userLng, plainStation.lat, plainStation.lng);
      }
      
      return plainStation;
    });

    // Filtruj po promieniu, jeśli parametry zostały prawidłowo przekazane
    if (!isNaN(userLat) && !isNaN(userLng)) {
      result = result.filter(station => station.distance <= rad);
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas pobierania stacji' });
  }
});

sequelize.sync().then(() => {
  console.log('Station database synced');
  app.listen(PORT, () => {
    console.log(`Station Service listening on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});
