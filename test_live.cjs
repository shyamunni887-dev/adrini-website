const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    let monorailRequests = [];
    page.on('request', request => {
        if (request.url().includes('monorail')) {
            console.log("MONORAIL REQUEST:", request.url(), request.postData());
        }
    });
    
    page.on('response', async response => {
        if (response.url().includes('monorail')) {
            console.log("MONORAIL RESPONSE:", response.status(), await response.text().catch(()=>""));
        }
    });

    console.log("Visiting https://adrini.com/?handle=banarasi-navy-blue-saree-rani-pink-zari-border");
    await page.goto('https://adrini.com/?handle=banarasi-navy-blue-saree-rani-pink-zari-border', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));
    await browser.close();
})();
