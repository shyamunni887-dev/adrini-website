const puppeteer = require('puppeteer');

(async () => {
    console.log('Launching browser for network validation...');
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    let graphqlRequests = 0;
    let pixelEvents = {};
    let imagesLoaded = [];

    await page.setRequestInterception(true);
    page.on('request', request => {
        const url = request.url();
        if (url.includes('graphql.json') || url.includes('/api/202')) graphqlRequests++;
        if (url.includes('facebook.com/tr')) {
            const evMatch = url.match(/ev=([^&]+)/);
            if (evMatch) {
                const ev = decodeURIComponent(evMatch[1]);
                pixelEvents[ev] = (pixelEvents[ev] || 0) + 1;
            }
        }
        if (url.includes('cdn.shopify.com/s/files') && request.resourceType() === 'image') {
            imagesLoaded.push(url);
        }
        request.continue();
    });

    console.log('Navigating to local SSR product page...');
    try {
        await page.goto('http://127.0.0.1:8080/products/black-mul-cotton-saree-multicolor-striped-pallu/index.html', { waitUntil: 'load', timeout: 10000 });
        console.log('Load event fired. Waiting 1s for pixels...');
        await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
        console.log('Navigation error (proceeding anyway):', e.message);
    }

    console.log('\n--- VALIDATION RESULTS ---');
    console.log(`1. GraphQL Requests on Load: ${graphqlRequests} (Expected: 0)`);
    console.log(`2. Meta Pixel Events Fired:`);
    for (const [ev, count] of Object.entries(pixelEvents)) {
        console.log(`   - ${ev}: ${count} time(s)`);
    }
    console.log(`3. Shopify Images Requested: ${imagesLoaded.length}`);
    if (imagesLoaded.length > 0) {
        console.log(`   - First image requested: ${imagesLoaded[0].substring(0, 100)}...`);
    }
    
    const initialStateStr = await page.evaluate(() => {
        return window.__INITIAL_STATE__ ? 'Present' : 'Missing';
    });
    console.log(`4. SSR State (window.__INITIAL_STATE__): ${initialStateStr}`);

    await browser.close();
    console.log('--------------------------');
    process.exit(0);
})();
