const jwt = require('jsonwebtoken');
const http = require('http');

const token = jwt.sign({ id: 1, email: 'test@example.com' }, 'supersecretkey');

const data = JSON.stringify({
  rating: 5,
  comment: 'Super stacja, miła obsługa!'
});

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/stations/1/ratings',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
    'Content-Length': Buffer.byteLength(data)
  }
};

setTimeout(() => {
  const req = http.request(options, res => {
    console.log(`\nResponse status: ${res.statusCode}`);
    let body = '';
    res.on('data', d => {
      body += d;
    });
    res.on('end', () => {
      console.log('Response body:', body);
    });
  });

  req.on('error', error => {
    console.error('Request error:', error);
  });

  req.write(data);
  req.end();
}, 1000);
