const puppeteer = require('puppeteer');

(async () => {
    console.log('Starting Live Staging Smoke Test...');
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    let graphqlRequests = 0;
    let pixelEvents = {};
    let imagesLoaded = [];
    let consoleErrors = [];
    let failedRequests = [];

    page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

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

    page.on('requestfailed', request => {
        const url = request.url();
        if (!url.includes('facebook.com') && !url.includes('google')) {
            failedRequests.push(`${url} (${request.failure().errorText})`);
        }
    });

    console.log('Navigating to live SSR product page...');
    try {
        await page.goto('https://staging--lively-semifreddo-529054.netlify.app/products/black-mul-cotton-saree-multicolor-striped-pallu/', { waitUntil: 'domcontentloaded', timeout: 5000 });
        await new Promise(r => setTimeout(r, 3000));
    } catch (e) {
        console.log('Navigation timeout (proceeding):', e.message);
    }

    console.log('\n--- SMOKE TEST RESULTS ---');
    console.log(`1. GraphQL Requests on Load: ${graphqlRequests} (Expected: ~6)`);
    console.log(`2. Meta Pixel Events Fired:`);
    for (const [ev, count] of Object.entries(pixelEvents)) {
        console.log(`   - ${ev}: ${count} time(s)`);
    }
    console.log(`3. Shopify Images Requested: ${imagesLoaded.length}`);
    
    const initialStateStr = await page.evaluate(() => {
        return window.__INITIAL_STATE__ ? 'Present' : 'Missing';
    });
    console.log(`4. SSR State (window.__INITIAL_STATE__): ${initialStateStr}`);
    console.log(`5. Console Errors: ${consoleErrors.length}`);
    console.log(`6. Failed Network Requests (non-ads): ${failedRequests.length}`);

    console.log('\n--- INTERACTIVITY TEST ---');
    try {
        await page.waitForSelector('.lm-pp-add-btn', { timeout: 2000 });
        await page.click('.lm-pp-add-btn');
        await new Promise(r => setTimeout(r, 2000));
        const cartDrawerVisible = await page.evaluate(() => {
            const drawer = document.getElementById('cart-drawer');
            return drawer && drawer.classList.contains('active');
        });
        console.log(`Add to Cart Drawer Opened: ${cartDrawerVisible}`);
    } catch (err) {
        console.log('Add to cart test failed:', err.message);
    }

    await browser.close();
    console.log('--------------------------');
    process.exit(0);
})();
