require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use('/api/auth', createProxyMiddleware({ target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001', changeOrigin: true }));

app.use('/api/users', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: (path, req) => req.originalUrl.replace(/^\/api\/users/, '/api/users')
}));

app.use('/api/stations', createProxyMiddleware({
  target: process.env.STATION_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: (path, req) => req.originalUrl.replace(/^\/api\/stations/, '/stations')
}));

app.use('/api/alerts', createProxyMiddleware({
  target: process.env.ALERT_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: (path, req) => req.originalUrl.replace(/^\/api\/alerts/, '/api/alerts')
}));

app.use('/api/favorites', createProxyMiddleware({
  target: process.env.FAVORITE_SERVICE_URL || 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: (path, req) => req.originalUrl.replace(/^\/api\/favorites/, '/api/favorites')
}));

app.get('/', (req, res) => {
  res.send('API Gateway działa poprawnie');
});

app.listen(PORT, () => {
  console.log(`API Gateway nasłuchuje na porcie ${PORT}`);
});
