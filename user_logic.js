function addToCart(id, name, price) {
    const item = { menu_id: id, name: name, price: price, qty: 1 };
    cart.push(item);
    alert(`${name} added to cart!`);
    updateCartCount();
}

function updateCartCount() {
    // Update angka di floating button
}