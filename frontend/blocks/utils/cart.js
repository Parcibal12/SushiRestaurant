const CART_STORAGE_KEY = 'sushi_cart';

export function getCart() {
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}


export function addToCart(productToAdd) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === productToAdd.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productToAdd.id,
            name: productToAdd.name,
            price: parseFloat(productToAdd.price),
            imageUrl: productToAdd.imageUrl,
            description: productToAdd.description,
            quantity: 1
        });
    }
    saveCart(cart);
}

export function removeFromCart(itemId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== itemId);
    saveCart(cart);
}

export function updateQuantity(itemId, quantity) {
    const cart = getCart();
    const itemToUpdate = cart.find(item => item.id === itemId);
    if (itemToUpdate) {
        itemToUpdate.quantity = quantity;
    }
    saveCart(cart);
}

export function updateCartIcon() {
    const cart = getCart();
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartBadge = document.querySelector('user-actions')?.shadowRoot.querySelector('.cart-badge');
    
    if (cartBadge) {
        if (totalItems > 0) {
            cartBadge.textContent = totalItems;
            cartBadge.style.display = 'flex';
        } else {
            cartBadge.style.display = 'none';
        }
    }
}