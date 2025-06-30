class EditPostForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.API_BASE_URL = 'http://localhost:3000/api';
        this.handleSubmit = this.handleSubmit.bind(this);
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
        

        const css = await fetch('blocks/blog/create-form/create-post.css').then(res => res.text());
        const template = await fetch('blocks/blog/edit-form/edit-post-form.html').then(res => res.text());
        
        this.shadowRoot.innerHTML = `<style>${css}</style>${template}`;

        if (this.postId) {
            this.loadPostData();
            this.addEventListeners();
        } else {
            this.shadowRoot.querySelector('.create-post-card').innerHTML = '<h1>Error: No se especificó un ID de post para editar.</h1>';
        }
    }
    
    addEventListeners() {
        const form = this.shadowRoot.getElementById('edit-post-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit);
        }
    }

    async loadPostData() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/blog/${this.postId}`);
            if (!response.ok) throw new Error('No se pudo cargar la información del post.');
            const post = await response.json();

            this.shadowRoot.getElementById('title').value = post.title;
            this.shadowRoot.getElementById('content').value = post.content;
            
            const bannerImg = this.shadowRoot.getElementById('post-banner-image');
            if (bannerImg) {
                bannerImg.src = post.imageUrl || '/assets/blog/blog-default.png';
            }

        } catch (error) {
            console.error('Error al cargar datos para editar:', error);
            alert('No se pudieron cargar los datos del post.');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        const updatedData = {
            title: this.shadowRoot.getElementById('title').value,
            content: this.shadowRoot.getElementById('content').value
        };
        const token = localStorage.getItem('sushi_token');
        if (!token) {
            return alert('Tu sesión ha expirado. Por favor inicia sesión de nuevo.');
        }
        try {
            const response = await fetch(`${this.API_BASE_URL}/blog/${this.postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar el post.');
            }
            alert('¡Publicación actualizada con éxito!');

            window.location.hash = '#/blog';

        } catch (error) {
            alert(`Error al actualizar: ${error.message}`);
        }
    }
    
    disconnectedCallback() {
        const form = this.shadowRoot.getElementById('edit-post-form');
        if(form) form.removeEventListener('submit', this.handleSubmit);
    }
}

customElements.define('edit-post-form', EditPostForm);