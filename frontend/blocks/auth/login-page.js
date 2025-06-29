class LoginPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async connectedCallback() {
        const css = await fetch('/frontend/blocks/auth/auth.css').then(res => res.text());
        const template = await fetch('/frontend/blocks/auth/login.html').then(res => res.text());
        this.shadowRoot.innerHTML = `<style>${css}</style>${template}`;
        this.addEventListeners();
    }
    
    addEventListeners() {
        this.shadowRoot.getElementById('login-form').addEventListener('submit', this.handleSubmit);
    }

    async handleSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const email = form.email.value;
        const password = form.password.value;

        if (!email || !password) {
            alert('Por favor, introduce email y contraseña.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error al iniciar sesión.');
            }
            localStorage.setItem('sushi_token', data.token);
            alert('Inicio de sesión exitoso');
            window.location.hash = '#/';
        } catch (error) {
            alert(error.message);
        }
    }

    disconnectedCallback() {
        const form = this.shadowRoot.getElementById('login-form');
        if (form) form.removeEventListener('submit', this.handleSubmit);
    }
}
customElements.define('login-page', LoginPage);