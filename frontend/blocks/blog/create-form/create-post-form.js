class CreatePostForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.API_BASE_URL = 'http://localhost:3000/api';
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async connectedCallback() {
        const css = await fetch('blocks/blog/create-form/create-post.css').then(res => res.text());
        const template = await fetch('blocks/blog/create-form/create-post.html').then(res => res.text());
        
        this.shadowRoot.innerHTML = `<style>${css}</style>${template}`;
        this.addEventListeners();
    }

    addEventListeners() {
        const form = this.shadowRoot.getElementById('create-post-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit);
        }
    }
    
    async handleSubmit(event) {
        event.preventDefault();

        const title = this.shadowRoot.getElementById('title').value;
        const content = this.shadowRoot.getElementById('content').value;
        const token = localStorage.getItem('sushi_token');

        if (!title || !content) {
            return alert('El título y el contenido son obligatorios.');
        }
        if (!token) {
            alert('Debes iniciar sesión para crear una publicación.');
            return;
        }

        const postData = { title, content };

        try {
            const response = await fetch(`${this.API_BASE_URL}/blog`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear el post.');
            }

            alert('¡Publicación creada con éxito!');
            

            window.location.hash = '#/blog';

        } catch (error) {
            alert(error.message);
            console.error(error);
        }
    }
    
    disconnectedCallback() {
        const form = this.shadowRoot.getElementById('create-post-form');
        if (form) {
            form.removeEventListener('submit', this.handleSubmit);
        }
    }
}

customElements.define('create-post-form', CreatePostForm);