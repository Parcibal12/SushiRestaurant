import { menuData } from './menu-data.js';

document.addEventListener('DOMContentLoaded', () => {

    const filterButtons = document.querySelectorAll('.menu-filters__button');
    const menuItems = document.querySelectorAll('.menu-item');
    const menuCategories = document.querySelectorAll('.menu-category');

    filterButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            handleFiltering(button.dataset.filter);
        });
    });

    menuItems.forEach(itemLink => {
        itemLink.addEventListener('click', (event) => {
            event.preventDefault();
            const url = new URL(itemLink.href, window.location.origin);
            const itemId = url.searchParams.get('item');
            
            history.pushState({ id: itemId }, '', itemLink.href);
            renderSingleItemView(itemId);
        });
    });

    const initialUrlParams = new URLSearchParams(window.location.search);
    const initialItemId = initialUrlParams.get('item');
    if (initialItemId) {
        renderSingleItemView(initialItemId);
    }

    function handleFiltering(filter) {
        filterButtons.forEach(btn => {
            btn.classList.toggle('menu-filters__button--active', btn.dataset.filter === filter);
        });

        menuItems.forEach(item => {
            item.classList.toggle('hidden', filter !== 'all' && item.dataset.category !== filter);
        });
        
        menuCategories.forEach(category => {
            const hasVisibleItems = category.querySelector('.menu-item:not(.hidden)');
            category.classList.toggle('hidden', filter !== 'all' && !hasVisibleItems);
        });
    }
});

function renderSingleItemView(itemId) {
    const itemData = menuData.find(item => item.id === itemId);
    if (!itemData) return;

    const banner = document.querySelector('.page-banner');
    const bannerTitle = document.querySelector('.page-banner__title');

    banner.style.backgroundImage = `url('${itemData.bannerImage}')`;
    bannerTitle.textContent = itemData.name;
    
    const filters = document.querySelector('.menu-filters');
    if (filters) filters.style.display = 'none';
}

window.addEventListener('popstate', () => {
    window.location.reload();
});