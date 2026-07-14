const __lmCart = [];

function addRecToCart(id, title, price, image, inventory, handle) {
    const existing = __lmCart.find(c => c.id === id);
    if (existing) {
        existing.qty = Math.min(inventory, existing.qty + 1);
    } else {
        __lmCart.push({ id, title, price, image, inventory, handle: handle || '', qty: 1 });
    }
}

function updateCartQty(id, delta) {
    const item = __lmCart.find(i => i.id === id);
    if (!item) return;
    const maxQty = item.inventory !== undefined ? item.inventory : 10;
    const newQty = Math.min(maxQty, item.qty + delta);
    if (newQty <= 0) {
        // remove
    } else {
        item.qty = newQty;
    }
}

const inventory = 10;
// First click
addRecToCart("1", "Saree 14", 999, "img", inventory, "handle1");
console.log("After add 1", __lmCart);
// + button click
updateCartQty("1", 1);
console.log("After update 1", __lmCart);
