document.addEventListener('DOMContentLoaded', () => {
    const postListContainer = document.querySelector('.post-list');
    const filterLinks = document.querySelectorAll('.blog-filters__link');
    const API_BASE_URL = 'http://localhost:3000/api';
    let currentUser = null;


    function createPostCard(post) {
        const article = document.createElement('article');
        article.className = 'post-card';
        article.dataset.postId = post.id;

        const isOwner = currentUser ? post.authorId === currentUser.id : false;

        const editIconUrl = '../../../assets/icons/edit.svg';
        const trashIconUrl = '../../../assets/icons/trash.svg';
        const likeIconUrl = '../../../assets/icons/like.svg';

        let ownerActionsHtml = '';
        if (isOwner) {
            ownerActionsHtml = `
                <a href="/frontend/blocks/blog/edit-post.html?id=${post.id}" class="post-card__action-btn edit-btn" title="Editar Post">
                    <img src="${editIconUrl}" alt="Editar">
                </a>
                <button class="post-card__action-btn delete-btn" title="Eliminar Post">
                    <img src="${trashIconUrl}" alt="Eliminar">
                </button>
            `;
        }

        const likeButtonHtml = `
            <button class="post-card__action-btn like-btn" title="Me Gusta">
                <img src="${likeIconUrl}" alt="Me Gusta">
            </button>
        `;

        const postDate = new Date(post.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
        const defaultImage = '../../../assets/blog/blog-default.png';

        article.innerHTML = `
            <div class="post-card__image-wrapper">
                <div class="post-card__actions">
                    ${likeButtonHtml}
                    ${ownerActionsHtml}
                </div>
                <a href="/frontend/blocks/blog/blog-single.html?id=${post.id}">
                    <img src="${post.imageUrl || defaultImage}" alt="${post.title}" class="post-card__image">
                </a>
            </div>
            <div class="post-card__info">
                <div class="post-card__meta">
                    <span>${postDate}</span>
                    <span class="like-count">${post.likeCount || 0} Likes</span>
                </div>
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


    const renderPosts = (posts, filterType) => {
        postListContainer.innerHTML = '';
        if (filterType === 'my-articles' && currentUser) {
            postListContainer.appendChild(createAddPostCard());
        }

        if (posts.length > 0) {
            posts.forEach(post => {
                postListContainer.appendChild(createPostCard(post));
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
        if (['my-articles', 'favorites'].includes(filter) && !token) {
            return alert('Debes iniciar sesión para ver esta sección.');
        }

        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        let endpoint = '';
        if (filter === 'all') endpoint = '/blog';
        else if (filter === 'my-articles') endpoint = '/blog/my-posts';
        else if (filter === 'favorites') endpoint = '/blog/my-favorites';
        else return;

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
            if (!response.ok) throw new Error('Error al cargar datos.');
            const posts = await response.json();
            renderPosts(posts, filter);
        } catch (error) {
            console.error('Error en el filtro:', error);
            postListContainer.innerHTML = `<p style="color:red; text-align:center;">${error.message}</p>`;
        }
    };
    
    postListContainer.addEventListener('click', async (event) => {
        const token = localStorage.getItem('sushi_token');
        const postCard = event.target.closest('.post-card');
        if (!postCard || !postCard.dataset.postId) return;

        const postId = postCard.dataset.postId;
        const deleteButton = event.target.closest('.delete-btn');
        const likeButton = event.target.closest('.like-btn');

        if (deleteButton) {
            event.stopPropagation(); event.preventDefault();
            if (confirm('¿Estás seguro de que quieres eliminar?')) {
                try {
                    await fetch(`${API_BASE_URL}/blog/${postId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                    postCard.remove();
                } catch (error) { alert(error.message); }
            }
        }

        if (likeButton) {
            event.stopPropagation(); event.preventDefault();
            if (!token) return alert('Debes iniciar sesión para dar "Me gusta".');
            try {
                const response = await fetch(`${API_BASE_URL}/blog/${postId}/like`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
                const result = await response.json();
                
                if (!response.ok) throw new Error(result.message);

                const likeCountSpan = postCard.querySelector('.like-count');
                likeCountSpan.textContent = `${result.newLikeCount} Likes`;
                likeButton.classList.toggle('liked', result.liked);
            } catch (error) { alert(`Error: ${error.message}`); }
        }
    });

    async function initializePage() {
        const token = localStorage.getItem('sushi_token');
        if (token) {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/profile`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (response.ok) {
                    currentUser = await response.json();
                } else {
                    localStorage.removeItem('sushi_token');
                }
            } catch (e) { currentUser = null; }
        }
        filterLinks.forEach(link => link.addEventListener('click', handleFilterClick));
        filterLinks[0].click();
    }

    initializePage();
});