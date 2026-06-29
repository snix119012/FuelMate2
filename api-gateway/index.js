require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use('/api/auth', createProxyMiddleware({ target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001', changeOrigin: true }));
app.use('/api/stations', createProxyMiddleware({ target: process.env.STATIONS_SERVICE_URL || 'http://localhost:3002', changeOrigin: true }));
app.use('/api/alerts', createProxyMiddleware({ target: process.env.ALERTS_SERVICE_URL || 'http://localhost:3003', changeOrigin: true }));
app.use('/api/favorites', createProxyMiddleware({ target: process.env.FAVORITES_SERVICE_URL || 'http://localhost:3004', changeOrigin: true }));

app.get('/', (req, res) => {
  res.send('API Gateway is running');
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
