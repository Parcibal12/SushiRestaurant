document.addEventListener('DOMContentLoaded', () => {
    const postListContainer = document.querySelector('.post-list');
    const filterLinks = document.querySelectorAll('.blog-filters__link');
    const API_BASE_URL = 'http://localhost:3000/api';
    let currentUser = null;


    function createPostCard(post, isOwner = false) {
        const article = document.createElement('article');
        article.className = 'post-card';
        article.dataset.postId = post.id;

        let actionsHtml = '';
        if (isOwner) {
            const trashIconUrl = '../../../assets/icons/trash.svg';
            actionsHtml = `
                <div class="post-card__actions">
                    <button class="post-card__action-btn delete-btn" title="Eliminar Post">
                        <img src="${trashIconUrl}" alt="Eliminar">
                    </button>
                </div>
            `;
        }
        
        const postDate = new Date(post.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
        const defaultImage = '../../../assets/blog/blog-default.png';

        article.innerHTML = `
            <a href="/frontend/blocks/blog/blog-single.html?id=${post.id}" class="post-card__image-link">
                ${actionsHtml}
                <img src="${post.imageUrl || defaultImage}" alt="${post.title}" class="post-card__image">
            </a>
            <div class="post-card__info">
                <div class="post-card__meta">${postDate}</div>
                <h3 class="post-card__title"><a href="/frontend/blocks/blog/blog-single.html?id=${post.id}">${post.title}</a></h3>
                <p class="post-card__excerpt">${post.content.substring(0, 100)}...</p>
                <p class="post-card__author">Autor: ${post.author ? post.author.name : 'Anónimo'}</p>
            </div>
        `;
        return article;
    }

    function createAddPostCard() {
        const article = document.createElement('article');
        article.className = 'post-card post-card--add-new';
        article.innerHTML = `
            <a href="/frontend/blocks/blog/create-post.html" class="add-post-link">
                <div class="add-post-link__icon-wrapper">
                    <span class="add-post-link__icon">+</span>
                </div>
                <div class="add-post-link__text-wrapper">
                    <h3 class="add-post-link__title">CREATE NEW POST</h3>
                    <p class="add-post-link__description">Comparte tus pensamientos y experiencias.</p>
                </div>
            </a>
        `;
        return article;
    }

    // --- Lógica principal ---

    const renderPosts = (posts, filterType) => {
        postListContainer.innerHTML = '';
        if (filterType === 'my-articles' && currentUser) {
            postListContainer.appendChild(createAddPostCard());
        }
        if (posts.length > 0) {
            posts.forEach(post => {
                const isOwner = currentUser ? post.authorId === currentUser.id : false;
                postListContainer.appendChild(createPostCard(post, isOwner));
            });
        } else if (filterType !== 'my-articles') {
            postListContainer.innerHTML = '<p style="text-align:center;">No se encontraron publicaciones.</p>';
        }
    };

    const handleFilterClick = async (e) => {
        e.preventDefault();
        const filter = e.target.dataset.filter;
        
        filterLinks.forEach(l => l.classList.remove('blog-filters__link--active'));
        e.target.classList.add('blog-filters__link--active');

        const token = localStorage.getItem('sushi_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        let endpoint = '';
        if (filter === 'all') {
            endpoint = '/blog';
        } else if (filter === 'my-articles') {
            if (!token) return alert('Debes iniciar sesión para ver tus artículos.');
            endpoint = '/blog/my-posts';
        } else {
            alert('Funcionalidad no implementada.');
            renderPosts([], filter);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
            if (!response.ok) throw new Error('Error al cargar los datos.');
            const posts = await response.json();
            renderPosts(posts, filter);
        } catch (error) {
            console.error('Error en el filtro:', error);
        }
    };

    postListContainer.addEventListener('click', async (event) => {
        const deleteButton = event.target.closest('.delete-btn');
        if (deleteButton) {
            const postCard = deleteButton.closest('.post-card');
            const postId = postCard.dataset.postId;
            const token = localStorage.getItem('sushi_token');

            if (confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
                try {
                    const response = await fetch(`${API_BASE_URL}/blog/${postId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error('No se pudo eliminar el post.');
                    postCard.remove();
                } catch (error) {
                    alert(error.message);
                }
            }
        }
    });

    async function initializePage() {
        const token = localStorage.getItem('sushi_token');
        if (token) {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) currentUser = await response.json();
            } catch (e) { currentUser = null; }
        }
        filterLinks.forEach(link => link.addEventListener('click', handleFilterClick));
        filterLinks[0].click();
    }

    initializePage();
});