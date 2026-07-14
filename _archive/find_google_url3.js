const https = require('https');

// Follow to the OAuth authorize page
const url = 'https://shopify.com/authentication/76900401325/oauth/authorize?client_id=49a47fa5-c3d0-4a41-aab7-babaf1f48b25&locale=en-IN&nonce=129f1ccd-cdf0-43ae-9c28-6d7eab682475&redirect_uri=https%3A%2F%2Fshopify.com%2F76900401325%2Faccount%2Fcallback&response_type=code&scope=openid+email+customer-account-api%3Afull&state=hWNClP6BEtCydZfbf2QWtdcf';
const parsed = new URL(url);

const options = {
  hostname: parsed.hostname,
  port: 443,
  path: parsed.pathname + parsed.search,
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    'Accept': 'text/html',
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Location:', res.headers.location);
    
    const googleMatches = body.match(/href="[^"]*(?:google|gid)[^"]*"/gi) || [];
    const actionMatches = body.match(/action="[^"]*"/gi) || [];
    const oauthUrls = body.match(/https:\/\/[^\s"'<>]*(?:google|oauth|accounts\.google)[^\s"'<>]*/gi) || [];
    
    console.log('\n=== Google href matches ===');
    googleMatches.forEach(m => console.log(m));
    console.log('\n=== Form actions ===');
    actionMatches.forEach(m => console.log(m));
    console.log('\n=== OAuth URLs ===');
    oauthUrls.slice(0,20).forEach(m => console.log(m));
    
    require('fs').writeFileSync('/tmp/oauth_page.html', body);
    console.log('\nFull page saved to /tmp/oauth_page.html, length:', body.length);
  });
});
req.on('error', e => console.error(e));
req.end();
