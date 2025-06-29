class BlogPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.API_BASE_URL = 'http://localhost:3000/api';
        this.currentUser = null;
        
        this.handleFilterClick = this.handleFilterClick.bind(this);
        this.handlePostActions = this.handlePostActions.bind(this);
    }


    async connectedCallback() {
        const css = await fetch('/frontend/blocks/blog/list/blog.css').then(res => res.text());
        const template = await fetch('/frontend/blocks/blog/list/blog.html').then(res => res.text());

        this.shadowRoot.innerHTML = `<style>${css}</style>${template}`;

        this.shadowRoot.innerHTML = `<style>${css}</style>${template}`;
        
        this.initializePage();
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector('.blog-filters').removeEventListener('click', this.handleFilterClick);
        this.shadowRoot.querySelector('.post-list').removeEventListener('click', this.handlePostActions);
    }


    async initializePage() {
        const token = localStorage.getItem('sushi_token');
        if (token) {
            try {
                const response = await fetch(`${this.API_BASE_URL}/auth/profile`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (response.ok) this.currentUser = await response.json();
            } catch (e) {
                console.error("Error fetching user profile:", e);
                this.currentUser = null;
            }
        }
        
        this.shadowRoot.querySelectorAll('.blog-filters__link').forEach(link => link.addEventListener('click', this.handleFilterClick));
        this.shadowRoot.querySelector('.post-list').addEventListener('click', this.handlePostActions);

        this.shadowRoot.querySelector('.blog-filters__link[data-filter="all"]').click();
    }

    async handleFilterClick(e) {
        e.preventDefault();
        const filterLink = e.target.closest('.blog-filters__link');
        if (!filterLink) return;

        const filter = filterLink.dataset.filter;
        
        this.shadowRoot.querySelectorAll('.blog-filters__link').forEach(l => l.classList.remove('blog-filters__link--active'));
        filterLink.classList.add('blog-filters__link--active');

        const token = localStorage.getItem('sushi_token');
        if (['my-articles', 'favorites'].includes(filter) && !token) {
            alert('Debes iniciar sesión para ver esta sección.');
            return;
        }

        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        let endpoint = '';
        if (filter === 'all') endpoint = '/blog';
        else if (filter === 'my-articles') endpoint = '/blog/my-posts';
        else if (filter === 'favorites') endpoint = '/blog/my-favorites';
        else return;

        try {
            const response = await fetch(`${this.API_BASE_URL}${endpoint}`, { headers });
            if (!response.ok) throw new Error('Error al cargar datos.');
            const posts = await response.json();
            this.renderPosts(posts, filter);
        } catch (error) {
            console.error('Error en el filtro:', error);
            this.shadowRoot.querySelector('.post-list').innerHTML = `<p style="color:red; text-align:center;">${error.message}</p>`;
        }
    }
    
    async handlePostActions(event) {
        const token = localStorage.getItem('sushi_token');
        const postCard = event.target.closest('.post-card');
        if (!postCard || !postCard.dataset.postId) return;

        const postId = postCard.dataset.postId;
        const deleteButton = event.target.closest('.delete-btn');
        const likeButton = event.target.closest('.like-btn');

        if (deleteButton) {
            event.stopPropagation();
            event.preventDefault();
            if (confirm('¿Estás seguro de que quieres eliminar este post?')) {
                try {
                    await fetch(`${this.API_BASE_URL}/blog/${postId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                    postCard.remove();
                } catch (error) { alert(error.message); }
            }
        }

        if (likeButton) {
            event.stopPropagation();
            event.preventDefault();
            if (!token) return alert('Debes iniciar sesión para dar "Me gusta".');
            try {
                const response = await fetch(`${this.API_BASE_URL}/blog/${postId}/like`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
                const result = await response.json();
                
                if (!response.ok) throw new Error(result.message);

                const likeCountSpan = postCard.querySelector('.like-count');
                likeCountSpan.textContent = `${result.newLikeCount} Likes`;
                likeButton.classList.toggle('liked', result.liked);
            } catch (error) { alert(`Error: ${error.message}`); }
        }
    }

    renderPosts(posts, filterType) {
        const postListContainer = this.shadowRoot.querySelector('.post-list');
        postListContainer.innerHTML = '';
        
        if (filterType === 'my-articles' && this.currentUser) {
            postListContainer.innerHTML += this.createAddPostCardHTML();
        }

        if (posts.length > 0) {
            posts.forEach(post => {
                postListContainer.innerHTML += this.createPostCardHTML(post);
            });
        } else if (filterType !== 'my-articles') {
            postListContainer.innerHTML = '<p style="text-align:center;">No se encontraron publicaciones.</p>';
        }
    }

    createPostCardHTML(post) {
        const isOwner = this.currentUser ? post.authorId === this.currentUser.id : false;
        
        const editIconUrl = '/assets/icons/edit.svg';
        const trashIconUrl = '/assets/icons/trash.svg';
        const likeIconUrl = '/assets/icons/like.svg';
        const defaultImage = '/assets/blog/blog-default.png';

        let ownerActionsHtml = '';
        if (isOwner) {
            ownerActionsHtml = `
                <a href="#/blog/edit/${post.id}" class="post-card__action-btn edit-btn" title="Editar Post">
                    <img src="${editIconUrl}" alt="Editar">
                </a>
                <button class="post-card__action-btn delete-btn" title="Eliminar Post">
                    <img src="${trashIconUrl}" alt="Eliminar">
                </button>
            `;
        }

        const postDate = new Date(post.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

        return `
            <article class="post-card" data-post-id="${post.id}">
                <div class="post-card__image-wrapper">
                    <div class="post-card__actions">
                        <button class="post-card__action-btn like-btn" title="Me Gusta">
                            <img src="${likeIconUrl}" alt="Me Gusta">
                        </button>
                        ${ownerActionsHtml}
                    </div>
                    <a href="#/blog/${post.id}">
                        <img src="${post.imageUrl || defaultImage}" alt="${post.title}" class="post-card__image">
                    </a>
                </div>
                <div class="post-card__info">
                    <div class="post-card__meta">
                        <span>${postDate}</span>
                        <span class="like-count">${post.likeCount || 0} Likes</span>
                    </div>
                    <h3 class="post-card__title"><a href="#/blog/${post.id}">${post.title}</a></h3>
                    <p class="post-card__excerpt">${post.content.substring(0, 100)}...</p>
                    <p class="post-card__author">Autor: ${post.author ? post.author.name : 'Anónimo'}</p>
                </div>
            </article>
        `;
    }

    createAddPostCardHTML() {
        return `
            <article class="post-card post-card--add-new">
                <a href="#/blog/create" class="add-post-link">
                    <div class="add-post-link__icon-wrapper">
                        <span class="add-post-link__icon">+</span>
                    </div>
                    <div class="add-post-link__text-wrapper">
                        <h3 class="add-post-link__title">CREATE NEW POST</h3>
                        <p class="add-post-link__description">Comparte tus pensamientos y experiencias.</p>
                    </div>
                </a>
            </article>
        `;
    }
}

customElements.define('blog-page', BlogPage);