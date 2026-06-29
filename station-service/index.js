require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const { Station, FuelType, Price, StationRating } = require('./models');
const authenticateToken = require('./middleware/auth');

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

app.post('/stations/:id/prices', authenticateToken, async (req, res) => {
  try {
    const stationId = parseInt(req.params.id);
    const { fuelTypeId, price } = req.body;
    const userId = req.user.id;

    if (isNaN(stationId)) {
      return res.status(400).json({ error: 'Nieprawidłowe ID stacji' });
    }
    
    if (!fuelTypeId || typeof price !== 'number') {
      return res.status(400).json({ error: 'Brak wymaganych danych: fuelTypeId oraz price (jako liczba)' });
    }

    const station = await Station.findByPk(stationId);
    if (!station) {
      return res.status(404).json({ error: 'Stacja nie została znaleziona' });
    }

    const fuelType = await FuelType.findByPk(fuelTypeId);
    if (!fuelType) {
      return res.status(404).json({ error: 'Typ paliwa nie istnieje' });
    }

    const newPrice = await Price.create({
      price,
      userId,
      stationId,
      fuelTypeId
    });

    res.status(201).json({ message: 'Cena dodana pomyślnie', price: newPrice });
  } catch (error) {
    console.error('Error adding price:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas dodawania ceny' });
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
