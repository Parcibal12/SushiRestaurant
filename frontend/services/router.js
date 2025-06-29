const routes = {
    '/': 'home-page',
    '/about': 'about-page',
    '/menu': 'menu-page',
    '/contact': 'contact-page',
    '/reservations': 'reservations-page',
    '/login': 'login-page',
    '/register': 'register-page',
    '/cart': 'cart-page',
    '/blog': 'blog-page',
    '/blog/create': 'create-post-form',
    '/blog/edit/:id': 'edit-post-form',
    '/blog/:id': 'blog-post-view'
};

async function loadComponentScript(componentTag) {
    if (customElements.get(componentTag)) return;
    let path;
    if (componentTag.includes('blog-') || componentTag.includes('-post-')) {
        const subfolderMap = { 'blog-page': 'list', 'blog-post-view': 'single-view', 'create-post-form': 'create-form', 'edit-post-form': 'edit-form' };
        path = `/frontend/blocks/blog/${subfolderMap[componentTag]}/${componentTag}.js`;
    } else if (componentTag.includes('login') || componentTag.includes('register')) {
        path = `/frontend/blocks/auth/${componentTag}.js`;
    } else {
        path = `/frontend/blocks/${componentTag.replace('-page', '')}/${componentTag}.js`;
    }
    try { await import(path); } catch (e) { console.error(`Router error loading: ${path}`, e); }
}
const handleLocation = async () => {
    const path = window.location.hash.substring(1) || '/';
    const appRoot = document.getElementById('app-root');
    if (!appRoot) return;

    let componentTag = null;
    let params = null;

    for (const route in routes) {
        const routeRegex = new RegExp(`^${route.replace(':id', '([a-zA-Z0-9-]+)')}$`);
        const match = path.match(routeRegex);
        if (match) {
            componentTag = routes[route];
            if (match[1]) {
                params = { id: match[1] };
            }
            break;
        }
    }

    if (!componentTag) {
        componentTag = 'home-page';
    }
    
    await loadComponentScript(componentTag);

    const pageComponent = document.createElement(componentTag);
    if (params) {
        pageComponent.setAttribute('post-id', params.id);
    }
    
    appRoot.innerHTML = '';
    appRoot.appendChild(pageComponent);
};

window.addEventListener('hashchange', handleLocation);
window.addEventListener('DOMContentLoaded', handleLocation);