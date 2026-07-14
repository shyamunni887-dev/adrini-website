const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="cart-drawer"></div><div id="cart-items"></div><div class="cart-count"></div></body></html>`, { url: "http://localhost/", runScripts: "dangerously" });
const window = dom.window;
const document = window.document;

// Mock localStorage
window.localStorage = {
    getItem: () => JSON.stringify([{id: '1', title: 'saree', price: 999}]),
    setItem: () => {}
};

// Add to global so main.js can access
global.window = window;
global.document = document;
global.localStorage = window.localStorage;

const mainJs = fs.readFileSync('src/scripts/main.js', 'utf8');
const script = document.createElement("script");
script.textContent = mainJs;
document.body.appendChild(script);

try {
    window.addAllWishlistToCart();
    console.log("Success");
} catch (e) {
    console.log("Error:", e);
}
