require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const Favorite = require('./models/Favorite');
const authenticateToken = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'favorite-service', port: PORT });
});

const favoriteRouter = express.Router();

favoriteRouter.get('/', authenticateToken, async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd podczas pobierania ulubionych' });
  }
});

favoriteRouter.post('/', authenticateToken, async (req, res) => {
  try {
    const { stationId, stationName } = req.body;

    if (!stationId || isNaN(Number(stationId))) {
      return res.status(400).json({ error: 'stationId jest wymagane i musi być liczbą' });
    }

    const [favorite, created] = await Favorite.findOrCreate({
      where: {
        userId: req.user.id,
        stationId: Number(stationId)
      },
      defaults: {
        stationName: stationName || null,
        notifyOnPriceChange: false
      }
    });

    if (!created) {
      return res.status(409).json({ error: 'Ta stacja jest już w ulubionych' });
    }

    res.status(201).json(favorite);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd podczas dodawania do ulubionych' });
  }
});

favoriteRouter.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const favorite = await Favorite.findOne({
      where: { id, userId: req.user.id }
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Nie znaleziono pozycji w ulubionych' });
    }

    await favorite.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd podczas usuwania z ulubionych' });
  }
});

favoriteRouter.patch('/:id/notifications', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'Pole enabled musi być boolean' });
    }

    const favorite = await Favorite.findOne({
      where: { id, userId: req.user.id }
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Nie znaleziono pozycji w ulubionych' });
    }

    favorite.notifyOnPriceChange = enabled;
    await favorite.save();

    res.json(favorite);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd podczas aktualizacji powiadomień' });
  }
});

// Obsługa zarówno bezpośrednich wywołań (/favorites) jak i przez API Gateway (/api/favorites)
app.use('/favorites', favoriteRouter);
app.use('/api/favorites', favoriteRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
});

sequelize.sync().then(() => {
  console.log('Favorite database synced');
  app.listen(PORT, () => {
    console.log(`Favorite Service listening on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});
