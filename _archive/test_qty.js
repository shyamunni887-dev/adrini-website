const item = { qty: 1 };
const maxQty = 10;
const delta = 1;
const newQty = Math.min(maxQty, item.qty + delta);
console.log('newQty:', newQty, typeof newQty);
