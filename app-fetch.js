const fs = require('fs');
const https = require('https');

https.get('https://raw.githubusercontent.com/ipaymu/ipaymu-nodejs-api/master/src/index.js', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data.substring(0, 1000)));
});
