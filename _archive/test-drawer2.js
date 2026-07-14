const fs = require('fs');

let document = {
    addEventListener: () => {},
    getElementById: (id) => {
        if (id === 'cart-drawer') return { classList: { toggle: ()=>{}, add: ()=>{}, contains: ()=>false } };
        if (id === 'cart-items') return { innerHTML: '' };
        if (id === 'wishlist-drawer') return { classList: { toggle: ()=>{}, add: ()=>{}, contains: ()=>true } };
        if (id === 'wishlist-items') return { innerHTML: '' };
        if (id === 'cart-total-amount') return { innerHTML: '', style: {} };
        return { style: {} };
    },
    querySelector: (sel) => {
        if (sel === '.cart-count') return { textContent: '' };
        return null;
    },
    querySelectorAll: () => [],
    body: { style: {} }
};
let window = { __lmCart: [] };
let localStorage = { getItem: () => '[]', setItem: () => {} };
let revealObs = { observe: () => {} };

// Expose mock environment
global.document = document;
global.window = window;
global.localStorage = localStorage;
global.revealObs = revealObs;

const code = fs.readFileSync('src/scripts/main.js', 'utf8');
eval(code);

window.wishlist = [{id: '1', title: 'saree', price: 999}];
try {
    window.addAllWishlistToCart();
    console.log("Success! cart length:", window.__lmCart.length);
} catch (e) {
    console.error("Error:", e);
}
