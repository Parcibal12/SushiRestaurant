import { addToCart, updateCartIcon } from '../utils/cart.js';

class MenuPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.API_BASE_URL = 'http://localhost:3000/api';
        this.allProducts = [];
    }

    async connectedCallback() {
        const css = await fetch('/frontend/blocks/menu/menu.css').then(res => res.text());
        const template = await fetch('/frontend/blocks/menu/menu.html').then(res => res.text());
        this.shadowRoot.innerHTML = `<style>${css}</style>${template}`;

        this.initialize();
    }
    
    async initialize() {
        this.cacheDOMElements();
        this.addEventListeners();

        try {
            const response = await fetch(`${this.API_BASE_URL}/products`);
            if (!response.ok) throw new Error('No se pudo cargar el menú.');
            this.allProducts = await response.json();
            this.renderMenu(this.allProducts);
            updateCartIcon();
        } catch (error) {
            console.error('Error al inicializar el menú:', error);
            this.menuContainer.innerHTML = '<p style="text-align:center;">Error al cargar el menú.</p>';
        }
    }

    cacheDOMElements() {
        this.menuContainer = this.shadowRoot.querySelector('.menu-list');
        this.filterButtons = this.shadowRoot.querySelectorAll('.menu-filters__button');
        this.modalOverlay = this.shadowRoot.getElementById('product-modal-overlay');
        this.modalCloseBtn = this.shadowRoot.getElementById('modal-close-btn');
        this.modalAddToCartBtn = this.shadowRoot.getElementById('modal-add-to-cart-btn');
        this.modalImage = this.shadowRoot.getElementById('modal-product-image');
        this.modalTitle = this.shadowRoot.getElementById('modal-product-title');
        this.modalDescription = this.shadowRoot.getElementById('modal-product-description');
        this.modalPrice = this.shadowRoot.getElementById('modal-product-price');
    }

    addEventListeners() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => this.handleFiltering(button.dataset.filter));
        });
        
        this.menuContainer.addEventListener('click', e => this.handleMenuClick(e));
        
        this.modalCloseBtn.addEventListener('click', () => this.closeModal());
        this.modalOverlay.addEventListener('click', e => {
            if (e.target === this.modalOverlay) this.closeModal();
        });
        this.modalAddToCartBtn.addEventListener('click', () => this.handleModalAddToCart());
    }

    handleMenuClick(e) {
        const addToCartBtn = e.target.closest('.menu-item__add-btn');
        const menuItem = e.target.closest('.menu-item');

        if (addToCartBtn) {
            e.preventDefault();
            e.stopPropagation();
            const product = this.allProducts.find(p => p.id == addToCartBtn.dataset.id);
            if (product) {
                addToCart(product);
                updateCartIcon();
                alert('Producto añadido');
            }
        } else if (menuItem) {
            e.preventDefault();
            const product = this.allProducts.find(p => p.id == menuItem.dataset.id);
            this.openModalWithProduct(product);
        }
    }

    handleModalAddToCart() {
        const productId = this.modalAddToCartBtn.dataset.productId;
        const product = this.allProducts.find(p => p.id == productId);
        if (product) {
            addToCart(product);
            updateCartIcon();
            alert('Producto añadido al carrito');
            this.closeModal();
        }
    }

    renderMenu(products) {
        this.menuContainer.innerHTML = '';
        const productsByCategory = products.reduce((acc, product) => {
            const categoryName = product.Category ? product.Category.name : 'Sin categoría';
            if (!acc[categoryName]) acc[categoryName] = [];
            acc[categoryName].push(product);
            return acc;
        }, {});

        for (const categoryName in productsByCategory) {
            const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
            const categorySection = document.createElement('section');
            categorySection.className = 'menu-category';
            categorySection.dataset.category = categoryId;
            
            let itemsHTML = '';
            productsByCategory[categoryName].forEach(product => {
                itemsHTML += this.createProductHTML(product);
            });

            categorySection.innerHTML = `
                <div class="menu-category__header">
                    <span class="menu-category__decorator"></span>
                    <h2 class="menu-category__title">${categoryName}</h2>
                    <span class="menu-category__decorator"></span>
                </div>
                <div class="menu-category__items">${itemsHTML}</div>
            `;
            this.menuContainer.appendChild(categorySection);
        }
    }

    createProductHTML(product) {
        const categorySlug = product.Category ? product.Category.name.toLowerCase().replace(/\s+/g, '-') : 'sin-categoria';
        return `
            <div class="menu-item" data-id="${product.id}" data-category="${categorySlug}">
                <div class="menu-item__visual-wrapper">
                    <img class="menu-item__image" src="${product.imageUrl || '/assets/menu/comida1.png'}" alt="${product.name}">
                    <button class="menu-item__add-btn" data-id="${product.id}">
                        <img src="../../../assets/icons/add.svg" alt="Añadir al carrito">
                    </button>
                </div>
                <div class="menu-item__info">
                    <div class="menu-item__header">
                        <h3 class="menu-item__name">${product.name}</h3>
                        <span class="menu-item__divider"></span>
                        <span class="menu-item__price">$${product.price}</span>
                    </div>
                    <p class="menu-item__description">${product.description}</p>
                </div>
            </div>
        `;
    }

    handleFiltering(filter) {
        this.shadowRoot.querySelectorAll('.menu-category').forEach(category => {
            category.style.display = (filter === 'all' || category.dataset.category === filter) ? 'flex' : 'none';
        });
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('menu-filters__button--active', btn.dataset.filter === filter);
        });
    }

    openModalWithProduct(product) {
        if (!product) return;
        this.modalImage.src = product.imageUrl || '/assets/menu/comida1.png';
        this.modalTitle.textContent = product.name;
        this.modalDescription.textContent = product.description;
        this.modalPrice.textContent = `$${product.price}`;
        this.modalAddToCartBtn.dataset.productId = product.id;
        this.modalOverlay.classList.add('modal-overlay--visible');
    }

    closeModal() {
        this.modalOverlay.classList.remove('modal-overlay--visible');
    }
}

customElements.define('menu-page', MenuPage);