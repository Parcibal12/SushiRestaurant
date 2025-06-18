document.addEventListener('DOMContentLoaded', () => {
    
    const filterButtons = document.querySelectorAll('.menu-filters__button');
    const menuItems = document.querySelectorAll('.menu-item');
    const menuCategories = document.querySelectorAll('.menu-category');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {

            const filter = button.dataset.filter;

            filterButtons.forEach(btn => btn.classList.remove('menu-filters__button--active'));
            button.classList.add('menu-filters__button--active');

            menuItems.forEach(item => {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });

            menuCategories.forEach(category => {
                const hasVisibleItems = category.querySelector('.menu-item:not(.hidden)');
                if (filter === 'all' || (hasVisibleItems && category.dataset.category === filter) ) {
                    category.classList.remove('hidden');
                } else {
                    category.classList.add('hidden');
                }
            });
        });
    });
});