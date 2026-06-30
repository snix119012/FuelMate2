require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
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
    const rad = parseFloat(radius) || 10;

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
      
      if (!isNaN(userLat) && !isNaN(userLng)) {
        plainStation.distance = getDistanceFromLatLonInKm(userLat, userLng, plainStation.lat, plainStation.lng);
      }
      
      return plainStation;
    });

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

    try {
      const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
      await axios.patch(`${authServiceUrl}/api/users/${userId}/points`, {
        points: 1
      }, {
        headers: { 'Authorization': req.headers['authorization'] }
      });
      console.log(`Pomyślnie dodano punkt dla użytkownika ${userId}`);
    } catch (authError) {
      console.warn(`Uwaga: Nie udało się dodać punktu dla użytkownika ${userId}. Auth Service odpowiedział: ${authError.message}`);
    }

    res.status(201).json({ message: 'Cena dodana pomyślnie', price: newPrice });
  } catch (error) {
    console.error('Error adding price:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas dodawania ceny' });
  }
});

app.post('/stations/:id/ratings', authenticateToken, async (req, res) => {
  try {
    const stationId = parseInt(req.params.id);
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (isNaN(stationId)) {
      return res.status(400).json({ error: 'Nieprawidłowe ID stacji' });
    }

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Ocena (rating) jest wymagana i musi być liczbą całkowitą od 1 do 5' });
    }

    const station = await Station.findByPk(stationId);
    if (!station) {
      return res.status(404).json({ error: 'Stacja nie została znaleziona' });
    }

    const newRating = await StationRating.create({
      rating,
      comment: comment || null,
      userId,
      stationId
    });

    const ratings = await StationRating.findAll({ where: { stationId } });
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    await station.update({ averageRating, ratingCount: ratings.length });

    res.status(201).json({ message: 'Ocena dodana pomyślnie', rating: newRating });
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas dodawania oceny' });
  }
});

app.get('/stations/:id/ratings', async (req, res) => {
  try {
    const stationId = parseInt(req.params.id);

    if (isNaN(stationId)) {
      return res.status(400).json({ error: 'Nieprawidłowe ID stacji' });
    }

    const ratings = await StationRating.findAll({
      where: { stationId },
      order: [['createdAt', 'DESC']]
    });

    res.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas pobierania ocen' });
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