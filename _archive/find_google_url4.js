const https = require('https');
const fs = require('fs');

// This is the actual Shopify login UI page - follow all redirects
const url = 'https://shopify.com/authentication/76900401325/login?client_id=49a47fa5-c3d0-4a41-aab7-babaf1f48b25&locale=en-IN&redirect_uri=%2Fauthentication%2F76900401325%2Foauth%2Fauthorize%3Fclient_id%3D49a47fa5-c3d0-4a41-aab7-babaf1f48b25%26locale%3Den-IN%26nonce%3D129f1ccd-cdf0-43ae-9c28-6d7eab682475%26redirect_uri%3Dhttps%253A%252F%252Fshopify.com%252F76900401325%252Faccount%252Fcallback%26response_type%3Dcode%26scope%3Dopenid%2Bemail%2Bcustomer-account-api%253Afull%26state%3DhWNClP6BEtCydZfbf2QWtdcf';
const parsed = new URL(url);

const options = {
  hostname: parsed.hostname,
  port: 443,
  path: parsed.pathname + parsed.search,
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-IN,en;q=0.9',
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Location:', res.headers.location);
    console.log('Body length:', body.length);
    
    if (body.length > 0) {
      fs.writeFileSync('/tmp/login_page.html', body);
      
      // Find Google auth endpoint
      const googleLinks = body.match(/href="([^"]*(?:google|gid|social)[^"]*)"/gi) || [];
      const googleActions = body.match(/action="([^"]*(?:google|gid|social)[^"]*)"/gi) || [];
      const allLinks = body.match(/href="(\/authentication[^"]*)"/gi) || [];
      const providerLinks = body.match(/\/authentication\/[^"']+\/google[^"']*/gi) || [];
      
      console.log('\nGoogle links:', googleLinks);
      console.log('Google actions:', googleActions);
      console.log('Auth links:', allLinks.slice(0, 20));
      console.log('Provider links:', providerLinks);
    }
  });
});
req.on('error', e => console.error(e));
req.end();
