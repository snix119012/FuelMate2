require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const { Station, FuelType, Price, StationRating } = require('./models');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'station-service', port: PORT });
});

sequelize.sync().then(() => {
  console.log('Station database synced');
  app.listen(PORT, () => {
    console.log(`Station Service listening on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});
