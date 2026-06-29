const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./models');
const alertRoutes = require('./routes/alertRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/alerts', alertRoutes);

const PORT = process.env.PORT || 3003;

sequelize.sync({ alter: true }).then(() => {
  console.log('Baza danych Alert Service zsynchronizowana.');
  app.listen(PORT, () => {
    console.log(`Alert Service działa na porcie ${PORT}`);
  });
}).catch(err => {
  console.error('Błąd połączenia z bazą:', err);
});