const https = require('https');

// Follow the redirect to the actual Shopify accounts page
const url = 'https://shopify.com/76900401325/account?locale=en';
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
    
    // Find Google-related URLs
    const googleMatches = body.match(/href="[^"]*google[^"]*"/gi) || [];
    const oauthMatches = body.match(/https:\/\/[^\s"'<>]*(?:google|oauth|gid|social)[^\s"'<>]*/gi) || [];
    const actionMatches = body.match(/<(?:a|button|form)[^>]*(?:google|oauth|social)[^>]*/gi) || [];
    
    console.log('\n=== Google href matches ===');
    googleMatches.forEach(m => console.log(m));
    console.log('\n=== OAuth URL matches ===');
    oauthMatches.slice(0,10).forEach(m => console.log(m));
    console.log('\n=== Element matches ===');
    actionMatches.slice(0,10).forEach(m => console.log(m));
    
    if (res.statusCode === 200) {
      // Save page to inspect
      require('fs').writeFileSync('/tmp/shopify_login.html', body);
      console.log('\nPage saved to /tmp/shopify_login.html');
    }
  });
});
req.on('error', e => console.error(e));
req.end();
