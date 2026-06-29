const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

app.use(cors());

// Auth Service: endpointy /register i /login (bez /api/auth)
app.use('/api/auth', createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true }));

// Station Service: endpointy /stations
app.use('/api/stations', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: (path, req) => '/stations' + req.url
}));

// Alert Service: endpointy /api/alerts
app.use('/api/alerts', createProxyMiddleware({
  target: 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: (path, req) => '/api/alerts' + req.url
}));

// Favorite Service: endpointy /api/favorites
app.use('/api/favorites', createProxyMiddleware({
  target: 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: (path, req) => '/api/favorites' + req.url
}));

app.get('/', (req, res) => {
  res.send('API Gateway is running');
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
