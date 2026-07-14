const https = require('https');

const options = {
  hostname: 'adrini-5666.myshopify.com',
  port: 443,
  path: '/account/login',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Accept': 'text/html',
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    // Look for google auth URL
    const googleMatches = body.match(/https?:\/\/[^\s"'<>]*google[^\s"'<>]*/gi) || [];
    const authMatches = body.match(/action="[^"]*"[^>]*google|google[^"]*"[^>]*action/gi) || [];
    const oauthMatches = body.match(/href="[^"]*(?:google|oauth|social|gid)[^"]*"/gi) || [];
    const formMatches = body.match(/<form[^>]*action="([^"]*)"[^>]*>/gi) || [];
    
    console.log('=== Google URL matches ===');
    console.log(googleMatches.slice(0, 10));
    console.log('\n=== OAuth href matches ===');
    console.log(oauthMatches.slice(0, 10));
    console.log('\n=== Form actions ===');
    formMatches.forEach(f => console.log(f));
    
    // Also log redirect URL
    console.log('\n=== Response headers ===');
    console.log('Status:', res.statusCode);
    console.log('Location:', res.headers.location);
  });
});

req.on('error', (e) => console.error(e));
req.end();
