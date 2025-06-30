import { getCart, removeFromCart, updateQuantity, updateCartIcon } from '../utils/cart.js';

class CartPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    async render() {
        const css = await fetch('/frontend/blocks/cart/cart.css').then(res => res.text());
        const template = await fetch('/frontend/blocks/cart/cart.html').then(res => res.text());
        this.shadowRoot.innerHTML = `<style>${css}</style>${template}`;

        this.renderCartContent();
    }

    renderCartContent() {
        const cart = getCart();
        const cartListContainer = this.shadowRoot.querySelector('.cart-items-list');
        const cartSummaryContainer = this.shadowRoot.querySelector('.cart-summary');

        cartListContainer.innerHTML = '';

        if (cart.length === 0) {
            cartListContainer.innerHTML = '<p style="text-align: center; padding: 2rem 0;">Tu carrito está vacío.</p>';
            cartSummaryContainer.style.display = 'none';
            return;
        }

        cartSummaryContainer.style.display = 'flex';

        cart.forEach(item => {
            cartListContainer.innerHTML += this.createCartItemHTML(item);
        });
        
        this.addEventListenersToItems();
        this.updateCartSummary();
    }
    
    addEventListenersToItems() {
        this.shadowRoot.querySelectorAll('.cart-item').forEach(itemElement => {
            const id = itemElement.dataset.id;
            itemElement.querySelector('.cart-item__remove-btn').addEventListener('click', () => {
                removeFromCart(id);
                updateCartIcon();
                this.renderCartContent();
            });
            itemElement.querySelector('.quantity-input').addEventListener('change', (event) => {
                const newQuantity = parseInt(event.target.value, 10);
                if (newQuantity > 0) {
                    updateQuantity(id, newQuantity);
                } else {
                    removeFromCart(id);
                }
                updateCartIcon();
                this.renderCartContent();
            });
        });
    }

    createCartItemHTML(item) {
        return `
            <article class="cart-item" data-id="${item.id}">
                <img class="cart-item__image" src="${item.imageUrl || '/assets/menu/comida1.png'}" alt="${item.name}">
                <div class="cart-item__details">
                    <h3 class="cart-item__name">${item.name}</h3>
                    <p class="cart-item__description">${item.description}</p>
                </div>
                <div class="cart-item__quantity">
                    <input class="quantity-input" type="number" value="${item.quantity}" min="1">
                </div>
                <div class="cart-item__price">$${(item.price * item.quantity).toFixed(2)}</div>
                <button class="cart-item__remove-btn" aria-label="Remove item">&times;</button>
            </article>
        `;
    }

    updateCartSummary() {
        const cart = getCart();
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const taxes = subtotal * 0.08;
        const total = subtotal + taxes;

        this.shadowRoot.getElementById('subtotal-value').textContent = `$${subtotal.toFixed(2)}`;
        this.shadowRoot.getElementById('taxes-value').textContent = `$${taxes.toFixed(2)}`;
        this.shadowRoot.getElementById('total-value').textContent = `$${total.toFixed(2)}`;
    }
}

customElements.define('cart-page', CartPage);