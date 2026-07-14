const https = require('https');

const data = JSON.stringify({
  query: `{ collections(first: 10) { edges { node { title handle } } } }`
});

const options = {
  hostname: 'adrini-5666.myshopify.com',
  port: 443,
  path: '/api/2024-01/graphql.json',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': '5a869208a525680f7f1f91e2d8b20a97',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(JSON.parse(body).data.collections.edges.map(e => e.node));
  });
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
