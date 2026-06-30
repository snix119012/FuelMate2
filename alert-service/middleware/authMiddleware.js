const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Brak tokenu autoryzacyjnego' });
  }

  const secret = process.env.JWT_SECRET || 'supersecretkey';
  jwt.verify(token, secret, (err, user) => {
    if (err) return res.status(403).json({ message: 'Nieprawidłowy lub wygasły token' });
    
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;