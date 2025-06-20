import { menuData } from './menu-data.js';
import { addToCart, updateCartIcon } from '../utils/cart.js';

function renderSingleItemView(itemId) {
    const itemData = menuData.find(item => item.id === itemId);
    if (!itemData) return;
    
    const banner = document.querySelector('.page-banner');
    const bannerTitle = document.querySelector('.page-banner__title');
    const filters = document.querySelector('.menu-filters');

    if (banner) banner.style.backgroundImage = `url('${itemData.bannerImage}')`;
    if (bannerTitle) bannerTitle.textContent = itemData.name;
    
    if (filters) filters.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.menu-filters__button');
    const menuItems = document.querySelectorAll('.menu-item');
    const menuCategories = document.querySelectorAll('.menu-category');
    const addToCartButtons = document.querySelectorAll('.menu-item__add-btn');

    function handleFiltering(filter) {
        menuItems.forEach(item => {
            item.classList.toggle('hidden', filter !== 'all' && item.dataset.category !== filter);
        });
        menuCategories.forEach(category => {
            const hasVisibleItems = category.querySelector('.menu-item:not(.hidden)');
            category.classList.toggle('hidden', filter !== 'all' && !hasVisibleItems);
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            handleFiltering(button.dataset.filter);
        });
    });

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const itemId = button.dataset.id;
            addToCart(itemId);
            updateCartIcon();
            alert('¡Producto añadido!');
        });
    });
    
    menuItems.forEach(itemLink => {
        itemLink.addEventListener('click', (event) => {
            if (event.target.closest('.menu-item__add-btn')) return;
            event.preventDefault();
            const itemId = itemLink.dataset.id;
            renderSingleItemView(itemId);
        });
    });
    
    const initialUrlParams = new URLSearchParams(window.location.search);
    const initialItemId = initialUrlParams.get('item');
    if (initialItemId) {
        renderSingleItemView(initialItemId);
    }
    
    updateCartIcon();
});

window.addEventListener('popstate', () => {
    window.location.reload();
});