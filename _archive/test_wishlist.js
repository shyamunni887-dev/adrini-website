const { JSDOM } = require('jsdom');
const dom = new JSDOM(`
  <button class="card-wish-btn" data-id="gid://shopify/123">
      <svg class="card-wish-icon" fill="#c9943a" stroke="#c9943a"></svg>
  </button>
`);
const document = dom.window.document;
let wishlist = [];

const cardBtns = document.querySelectorAll('.card-wish-btn');
cardBtns.forEach(btn => {
    const id = btn.getAttribute('data-id');
    const icon = btn.querySelector('.card-wish-icon');
    if (!icon || !id) return;
    const isWished = wishlist.find(i => i.id === id);
    icon.setAttribute('fill', isWished ? '#c9943a' : 'none');
    icon.setAttribute('stroke', isWished ? '#c9943a' : 'currentColor');
});

console.log('Fill:', document.querySelector('.card-wish-icon').getAttribute('fill'));
