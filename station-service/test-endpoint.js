const jwt = require('jsonwebtoken');
const http = require('http');

const token = jwt.sign({ id: 1, email: 'test@example.com' }, 'supersecretkey');

const data = JSON.stringify({
  fuelTypeId: 1,
  price: 6.54
});

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/stations/1/prices',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
    'Content-Length': data.length
  }
};

setTimeout(() => {
  const req = http.request(options, res => {
    console.log(`\nResponse status: ${res.statusCode}`);
    res.on('data', d => {
      console.log('Response body:', d.toString());
    });
  });

  req.on('error', error => {
    console.error('Request error:', error);
  });

  req.write(data);
  req.end();
}, 1000);
