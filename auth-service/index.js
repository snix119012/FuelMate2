require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const sequelize = require('./db');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, city, postalCode } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Użytkownik już istnieje' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      city,
      postalCode
    });

    res.status(201).json({ message: 'Użytkownik utworzony pomyślnie', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

async function addPoints(req, res) {
  try {
    const { id } = req.params;
    const { points } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony' });
    }

    user.points = (user.points || 0) + parseInt(points || 0);
    await user.save();

    res.json({ message: 'Punkty przyznane pomyślnie', currentPoints: user.points });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera podczas dodawania punktów' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'city', 'postalCode', 'points', 'isAdmin']
    });

    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
}

// Endpoint używany przez alert-service i station-service
app.patch('/api/users/:id/points', addPoints);
// Alias dla station-service, który odwołuje się bezpośrednio bez /api
app.patch('/users/:id/points', addPoints);

app.get('/', (req, res) => {
  res.send('Auth Service działa poprawnie');
});

sequelize.sync().then(() => {
  console.log('Baza danych zsynchronizowana');
  app.listen(PORT, () => {
    console.log(`Auth Service nasłuchuje na porcie ${PORT}`);
  });
}).catch(err => {
  console.error('Nie udało się zsynchronizować bazy danych:', err);
});