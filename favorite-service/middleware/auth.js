const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Brak tokena autoryzacyjnego' });
  }

  const secret = process.env.JWT_SECRET || 'supersecretkey';
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      console.error('JWT verify error:', err.message);
      return res.status(403).json({ error: 'Token nieprawidłowy lub wygasł' });
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
