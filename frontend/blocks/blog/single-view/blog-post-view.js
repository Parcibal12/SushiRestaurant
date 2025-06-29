class BlogPostView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.API_BASE_URL = 'http://localhost:3000/api';
    }

    static get observedAttributes() {
        return ['post-id'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'post-id' && oldValue !== newValue && newValue) {
            this.postId = newValue;
            if (this.shadowRoot.innerHTML) {
                this.loadPostData();
            }
        }
    }
    
    async connectedCallback() {
        this.postId = this.getAttribute('post-id');

        const css = await fetch('/frontend/blocks/blog/single-view/blog-single.css').then(res => res.text());
        const template = await fetch('/frontend/blocks/blog/single-view/blog-single.html').then(res => res.text());

        this.shadowRoot.innerHTML = `<style>${css}</style>${template}`;
        
        if (this.postId) {
            this.loadPostData();
        } else {
            this.shadowRoot.querySelector('.blog-post').innerHTML = '<h1>Error: No se ha especificado un ID de post.</h1>';
        }
    }

    async loadPostData() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/blog/${this.postId}`);
            if (!response.ok) {
                throw new Error('Post no encontrado');
            }
            const post = await response.json();

            const bannerImg = this.shadowRoot.getElementById('post-banner-image');
            const titleEl = this.shadowRoot.getElementById('post-title');
            const dateEl = this.shadowRoot.getElementById('post-date');
            const bodyEl = this.shadowRoot.getElementById('post-body');
            const authorEl = this.shadowRoot.getElementById('post-author');
            
            bannerImg.src = post.imageUrl || '/assets/blog/blog-default.png';
            bannerImg.alt = `Banner de ${post.title}`;
            titleEl.textContent = post.title;
            const postDate = new Date(post.createdAt);
            dateEl.textContent = postDate.toLocaleDateString('es-ES', { dateStyle: 'long' });
            dateEl.setAttribute('datetime', postDate.toISOString());

            bodyEl.innerHTML = post.content; 
            authorEl.textContent = `Por: ${post.author ? post.author.name : 'Anónimo'}`;

        } catch (error) {
            console.error('Error al cargar el post:', error);
            const postContainer = this.shadowRoot.querySelector('.blog-post');
            if (postContainer) {
                 postContainer.innerHTML = `
                    <h1>Post no encontrado</h1>
                    <p>El artículo que estás buscando no existe o ha sido removido.</p>
                `;
            }
        }
    }
}

customElements.define('blog-post-view', BlogPostView);