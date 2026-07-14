const fs = require('fs');
let code = fs.readFileSync('src/scripts/main.js', 'utf8');
// mock dom
let document = {
    addEventListener: () => {},
    getElementById: () => ({ style: {}, classList: { toggle: ()=>{}, add: ()=>{}, contains: ()=>false } }),
    querySelector: () => ({ style: {}, classList: { toggle: ()=>{}, add: ()=>{}, contains: ()=>false }, textContent: '' }),
    querySelectorAll: () => [],
    body: { style: {} }
};
let window = { __lmCart: [] };
let localStorage = { getItem: () => '[]', setItem: () => {} };
let revealObs = { observe: () => {} };

eval(code);

wishlist = [{id: '1', title: 'saree', price: 999}];
window.addAllWishlistToCart();
console.log(window.__lmCart);
