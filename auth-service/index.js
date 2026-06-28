const express = require('express');
const sequelize = require('./db');
const User = require('./models/User');
const app = express();
const PORT = 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Auth Service is running');
});

sequelize.sync().then(() => {
  console.log('Database synced');
  app.listen(PORT, () => {
    console.log(`Auth Service listening on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});
