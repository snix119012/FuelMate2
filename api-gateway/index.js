const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

app.use(cors());

app.use('/api/auth', createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true }));
app.use('/api/stations', createProxyMiddleware({ target: 'http://localhost:3002', changeOrigin: true }));
app.use('/api/alerts', createProxyMiddleware({ target: 'http://localhost:3003', changeOrigin: true }));
app.use('/api/favorites', createProxyMiddleware({ target: 'http://localhost:3004', changeOrigin: true }));

app.get('/', (req, res) => {
  res.send('API Gateway is running');
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
