import { getCart, removeFromCart, updateQuantity } from '../utils/cart.js';

document.addEventListener('DOMContentLoaded', () => {
    renderCartPage();
});

function renderCartPage() {
    const cart = getCart();
    const cartListContainer = document.querySelector('.cart-items-list');
    const cartSummaryContainer = document.querySelector('.cart-summary');
    
    cartListContainer.innerHTML = '';

    if (cart.length === 0) {
        cartListContainer.innerHTML = '<p style="text-align: center; padding: 2rem 0;">Tu carrito está vacío.</p>';
        cartSummaryContainer.style.display = 'none';
        return;
    }

    cartSummaryContainer.style.display = 'block';

    cart.forEach(item => {
        const cartItemElement = createCartItemElement(item);
        cartListContainer.appendChild(cartItemElement);
    });

    updateCartSummary();
}

function createCartItemElement(item) {
    const article = document.createElement('article');
    article.className = 'cart-item';
    article.dataset.id = item.id;

    const image = document.createElement('img');
    image.className = 'cart-item__image';
    image.src = item.image || '/assets/menu/comida1.png';
    image.alt = item.name;

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'cart-item__details';

    const nameH3 = document.createElement('h3');
    nameH3.className = 'cart-item__name';
    nameH3.textContent = item.name;
    

    const descriptionP = document.createElement('p');
    descriptionP.className = 'cart-item__description';
    descriptionP.textContent = item.description;

    const quantityDiv = document.createElement('div');
    quantityDiv.className = 'cart-item__quantity';

    const quantityInput = document.createElement('input');
    quantityInput.className = 'quantity-input';
    quantityInput.type = 'number';
    quantityInput.value = item.quantity;
    quantityInput.min = '1';

    const priceDiv = document.createElement('div');
    priceDiv.className = 'cart-item__price';
    priceDiv.textContent = `$${(item.price * item.quantity).toFixed(2)}`;

    const removeButton = document.createElement('button');
    removeButton.className = 'cart-item__remove-btn';
    removeButton.setAttribute('aria-label', 'Remove item');
    removeButton.textContent = '×';

    removeButton.addEventListener('click', () => {
        removeFromCart(item.id);
        renderCartPage();
    });

    quantityInput.addEventListener('change', (event) => {
        const newQuantity = parseInt(event.target.value, 10);
        if (newQuantity > 0) {
            updateQuantity(item.id, newQuantity);
        } else {
            removeFromCart(item.id);
        }
        renderCartPage();
    });

    detailsDiv.appendChild(nameH3);
    detailsDiv.appendChild(descriptionP); 
    
    quantityDiv.appendChild(quantityInput);
    
    article.appendChild(image);
    article.appendChild(detailsDiv);
    article.appendChild(quantityDiv);
    article.appendChild(priceDiv);
    article.appendChild(removeButton);

    return article;
}

function updateCartSummary() {
    const cart = getCart();
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const taxes = subtotal * 0.08;
    const total = subtotal + taxes;

    const summaryValues = document.querySelectorAll('.summary-row__value');
    if (summaryValues.length === 3) {
        summaryValues[0].textContent = `$${subtotal.toFixed(2)}`;
        summaryValues[1].textContent = `$${taxes.toFixed(2)}`;
        summaryValues[2].textContent = `$${total.toFixed(2)}`;
    }
}