import { addToCart, updateCartIcon } from '../utils/cart.js';

document.addEventListener('DOMContentLoaded', async () => {
    const menuContainer = document.querySelector('.menu-list');
    const filterButtons = document.querySelectorAll('.menu-filters__button');
    const modalOverlay = document.getElementById('product-modal-overlay');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart-btn');
    
    let allProducts = [];

    function openModalWithProduct(product) {
        if (!product) return;
        
        document.getElementById('modal-product-image').src = product.imageUrl || '/assets/menu/comida1.png';
        document.getElementById('modal-product-title').textContent = product.name;
        document.getElementById('modal-product-description').textContent = product.description;
        document.getElementById('modal-product-price').textContent = `$${product.price}`;
        modalAddToCartBtn.dataset.productId = product.id;

        modalOverlay.classList.add('modal-overlay--visible');
    }

    function closeModal() {
        modalOverlay.classList.remove('modal-overlay--visible');
    }

    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    modalAddToCartBtn.addEventListener('click', () => {
        const productId = modalAddToCartBtn.dataset.productId;
        const product = allProducts.find(p => p.id == productId);
        if (product) {
            addToCart(product);
            updateCartIcon();
            alert('¡Producto añadido al carrito!');
            closeModal();
        }
    });

    function createProductElement(product) {
        const productItem = document.createElement('a');
        productItem.className = 'menu-item';
        productItem.dataset.id = product.id;
        productItem.dataset.category = product.Category.name.toLowerCase().replace(' ', '-');
        
        productItem.innerHTML = `
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
        `;
        return productItem;
    }

    function renderMenu(products) {
        menuContainer.innerHTML = '';
        
        const productsByCategory = products.reduce((acc, product) => {
            const categoryName = product.Category ? product.Category.name : 'Sin Categoría';
            if (!acc[categoryName]) acc[categoryName] = [];
            acc[categoryName].push(product);
            return acc;
        }, {});

        for (const categoryName in productsByCategory) {
            const categorySection = document.createElement('section');
            categorySection.className = 'menu-category';
            categorySection.dataset.category = categoryName.toLowerCase().replace(' ', '-');

            categorySection.innerHTML = `
                <div class="menu-category__header">
                    <span class="menu-category__decorator"></span>
                    <h2 class="menu-category__title">${categoryName}</h2>
                    <span class="menu-category__decorator"></span>
                </div>
            `;
            const itemsGrid = document.createElement('div');
            itemsGrid.className = 'menu-category__items';
            productsByCategory[categoryName].forEach(product => {
                itemsGrid.appendChild(createProductElement(product));
            });
            categorySection.appendChild(itemsGrid);
            menuContainer.appendChild(categorySection);
        }
    }

    function handleFiltering(filter) {
        document.querySelectorAll('.menu-category').forEach(category => {
            category.style.display = (filter === 'all' || category.dataset.category === filter) ? 'block' : 'none';
        });
        filterButtons.forEach(btn => {
            btn.classList.toggle('menu-filters__button--active', btn.dataset.filter === filter);
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            handleFiltering(button.dataset.filter);
        });
    });

    menuContainer.addEventListener('click', (e) => {
        const addToCartBtn = e.target.closest('.menu-item__add-btn');
        const menuItem = e.target.closest('.menu-item');

        if (addToCartBtn) {
            e.preventDefault();
            e.stopPropagation();
            const productId = addToCartBtn.dataset.id;
            const product = allProducts.find(p => p.id == productId);
            if (product) {
                addToCart(product);
                updateCartIcon();
                alert('¡Producto añadido!');
            }
        } else if (menuItem) {
            e.preventDefault();
            const productId = menuItem.dataset.id;
            const product = allProducts.find(p => p.id == productId);
            openModalWithProduct(product);
        }
    });

    async function initializeMenu() {
        try {
            const response = await fetch('http://localhost:3000/api/products');
            if (!response.ok) throw new Error('No se pudo cargar el menú.');
            allProducts = await response.json();
            renderMenu(allProducts);
            updateCartIcon();
        } catch (error) {
            console.error('Error al inicializar el menú:', error);
            menuContainer.innerHTML = '<p style="text-align:center;">Error al cargar el menú.</p>';
        }
    }

    initializeMenu();
});