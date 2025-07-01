import { addToCart, updateCartIcon } from '../utils/cart.js';
import InfiniteScrollManager from '../../services/InfiniteScrollManager.js';

class MenuPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.API_BASE_URL = 'http://localhost:3000/api';
        
        this.products = []; 
        this.infiniteScrollManager = null; 
        this.isLoading = false; 
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

        const fetchProductsCallback = async (limit, offset, filter) => {
            let url = `${this.API_BASE_URL}/products?limit=${limit}&offset=${offset}`;
            if (filter !== 'all') {
                url += `&category=${filter.toLowerCase()}`; 
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar productos desde la API.');
            const data = await response.json();
            return { items: data.products, total: data.total, hasMore: data.hasMore };
        };


        const scrollRoot = this.shadowRoot.querySelector('.page-content'); 
        this.infiniteScrollManager = new InfiniteScrollManager(
            fetchProductsCallback,
            this.loadingIndicator,
            10,
            scrollRoot 
        );

        const onDataLoaded = (accumulatedProducts, hasMore) => {
            this.products = accumulatedProducts; 
            this.renderMenu(this.products); 
            if (!hasMore && this.products.length > 0) {
                this.loadingIndicator.textContent = 'No hay más productos para mostrar';
                this.loadingIndicator.style.visibility = 'visible';
                this.loadingIndicator.style.opacity = '1';
            }
        };

        const onLoadingChange = (isLoading) => {
            this.isLoading = isLoading;
            if(this.infiniteScrollManager.hasMoreData) {
                 this.loadingIndicator.style.visibility = isLoading ? 'visible' : 'hidden'; 
                 this.loadingIndicator.style.opacity = isLoading ? '1' : '0'; 
            } else {
                this.loadingIndicator.style.visibility = 'visible';
                this.loadingIndicator.style.opacity = '1';
            }
        };

        await this.infiniteScrollManager.init(onDataLoaded, onLoadingChange);
        updateCartIcon();
    }

    disconnectedCallback() {
        if (this.infiniteScrollManager) {
            this.infiniteScrollManager.disconnect();
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

        this.loadingIndicator = document.createElement('p');
        this.loadingIndicator.textContent = 'Cargando más productos...';
        this.loadingIndicator.style.textAlign = 'center';
        this.loadingIndicator.style.padding = '20px 0';
        this.loadingIndicator.style.width = '100%'; 
        this.loadingIndicator.style.visibility = 'hidden'; 
        this.loadingIndicator.style.opacity = '0';
        this.loadingIndicator.style.transition = 'opacity 0.3s ease, visibility 0.3s ease'; 

        if (this.menuContainer) {
            this.menuContainer.appendChild(this.loadingIndicator); 
        } else {
            this.shadowRoot.appendChild(this.loadingIndicator); 
        }
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
            const product = this.products.find(p => p.id == addToCartBtn.dataset.id); 
            if (product) {
                addToCart(product);
                updateCartIcon();
                alert('Producto añadido');
            }
        } else if (menuItem) {
            e.preventDefault();
            const product = this.products.find(p => p.id == menuItem.dataset.id); 
            this.openModalWithProduct(product);
        }
    }

    handleModalAddToCart() {
        const productId = this.modalAddToCartBtn.dataset.productId;
        const product = this.products.find(p => p.id == productId); 
        if (product) {
            addToCart(product);
            updateCartIcon();
            alert('Producto añadido al carrito');
            this.closeModal();
        }
    }

    renderMenu(productsToRender) { 
        const loadingIndicatorExists = this.loadingIndicator && this.loadingIndicator.parentNode;
        if (loadingIndicatorExists) {
            this.loadingIndicator.remove(); 
            this.menuContainer.innerHTML = ''; 
        } else {
            this.menuContainer.innerHTML = ''; 
        }

        const productsByCategory = productsToRender.reduce((acc, product) => {
            const categoryName = product.Category && product.Category.name ? product.Category.name : 'Sin categoría';
            if (!acc[categoryName]) acc[categoryName] = [];
            acc[categoryName].push(product);
            return acc;
        }, {});

        const orderedCategories = Object.keys(productsByCategory).sort((a, b) => {
            return a.localeCompare(b);
        });

        orderedCategories.forEach(categoryName => {
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
        });
        
        if (loadingIndicatorExists) {
            this.menuContainer.appendChild(this.loadingIndicator);
        }
        if (productsToRender.length === 0 && !this.isLoading && !this.infiniteScrollManager.hasMoreData) { 
            if (this.infiniteScrollManager.activeFilter !== 'all') {
                this.menuContainer.innerHTML = '<p style="text-align:center;">No hay productos en esta categoría.</p>';
            } else {
                this.menuContainer.innerHTML = '<p style="text-align:center;">No hay productos disponibles.</p>';
            }
        } else if (this.products.length > 0 && !this.infiniteScrollManager.hasMoreData && !this.isLoading) {
            const noMoreProductsMessage = document.createElement('p');
            noMoreProductsMessage.textContent = '¡Has visto todos los productos!';
            noMoreProductsMessage.style.textAlign = 'center';
            noMoreProductsMessage.style.padding = '20px 0';
            noMoreProductsMessage.style.color = 'var(--color-text-secondary)';
            this.menuContainer.appendChild(noMoreProductsMessage);
        }
    }

    createProductHTML(product) {
        const categorySlug = product.Category && product.Category.name ? product.Category.name.toLowerCase().replace(/\s+/g, '-') : 'sin-categoria';
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

    async handleFiltering(filter) {
        if (this.isLoading) return; 
        
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('menu-filters__button--active', btn.dataset.filter === filter);
        });
        
        await this.infiniteScrollManager.applyFilter(filter); 
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