class RegisterPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async connectedCallback() {
        const css = await fetch('/frontend/blocks/auth/auth.css').then(res => res.text());
        const template = await fetch('/frontend/blocks/auth/register.html').then(res => res.text());

        this.shadowRoot.innerHTML = `<style>${css}</style>${template}`;
        this.addEventListeners();
    }
    
    addEventListeners() {
        const form = this.shadowRoot.getElementById('register-form');
        form.addEventListener('submit', this.handleSubmit);
    }

    async handleSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const name = form.name.value;
        const email = form.email.value;
        const password = form.password.value;
        const confirmPassword = form['confirm-password'].value;

        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }
        if (!name || !email || !password) {
            alert('Por favor rellena todos los campos.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en el registro.');
            }

            alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
            window.location.hash = '#/login';

        } catch (error) {
            alert(error.message);
        }
    }

    disconnectedCallback() {
        const form = this.shadowRoot.getElementById('register-form');
        if (form) {
            form.removeEventListener('submit', this.handleSubmit);
        }
    }
}

customElements.define('register-page', RegisterPage);