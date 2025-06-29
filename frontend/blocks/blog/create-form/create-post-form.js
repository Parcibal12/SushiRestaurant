class CreatePostForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.API_BASE_URL = 'http://localhost:3000/api';
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async connectedCallback() {
        const css = await fetch('/frontend/blocks/blog/create-form/create-post.css').then(res => res.text());
        const template = await fetch('/frontend/blocks/blog/create-form/create-post.html').then(res => res.text());
        this.shadowRoot.innerHTML = `<style>${css}</style>${template}`;

        this.addEventListeners();
    }

    addEventListeners() {
        const form = this.shadowRoot.getElementById('create-post-form');
        const imageUploader = this.shadowRoot.getElementById('image-uploader');
        const imageInput = this.shadowRoot.getElementById('image-upload');
        
        form.addEventListener('submit', this.handleSubmit);
        imageUploader.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', this.previewImage.bind(this));
    }
    
    previewImage(event) {
        const imageInput = event.target;
        const imagePreviewContainer = this.shadowRoot.getElementById('image-preview');
        const file = imageInput.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreviewContainer.innerHTML = `<img src="${e.target.result}" alt="Vista previa de la imagen">`;
            };
            reader.readAsDataURL(file);
        }
    }

    async handleSubmit(event) {
        event.preventDefault();

        const title = this.shadowRoot.getElementById('title').value;
        const content = this.shadowRoot.getElementById('content').value;
        const imageFile = this.shadowRoot.getElementById('image-upload').files[0];
        const token = localStorage.getItem('sushi_token');

        if (!title || !content || !imageFile) {
            return alert('Todos los campos, incluida la imagen, son obligatorios.');
        }
        if (!token) {
            alert('Debes iniciar sesión para crear una publicación.');

            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('image', imageFile);

        try {
            const response = await fetch(`${this.API_BASE_URL}/blog`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear el post.');
            }

            alert('¡Publicación creada con éxito!');

            event.target.reset();
            this.shadowRoot.getElementById('image-preview').innerHTML = `
                <span class="form-group__image-icon">+</span>
                <span class="form-group__image-text">Click to upload</span>
            `;

        } catch (error) {
            alert(error.message);
            console.error(error);
        }
    }
    
    disconnectedCallback() {
        const form = this.shadowRoot.getElementById('create-post-form');
        if(form) form.removeEventListener('submit', this.handleSubmit);
    }
}

customElements.define('create-post-form', CreatePostForm);