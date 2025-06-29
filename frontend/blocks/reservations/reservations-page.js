class ReservationsPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.API_BASE_URL = 'http://localhost:3000/api';
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async connectedCallback() {
        const css = await fetch('/frontend/blocks/reservations/reservations.css').then(res => res.text());
        const template = await fetch('/frontend/blocks/reservations/reservations.html').then(res => res.text());
        this.shadowRoot.innerHTML = `<style>${css}</style>${template}`;

        this.initialize();
    }
    
    async initialize() {
        this.form = this.shadowRoot.getElementById('reservation-form');
        this.messageContainer = document.createElement('div');
        this.messageContainer.className = 'confirmation-message';
        this.form.before(this.messageContainer);

        this.form.addEventListener('submit', this.handleSubmit);
        
        const token = localStorage.getItem('sushi_token');
        if (token) {
            try {
                const response = await fetch(`${this.API_BASE_URL}/auth/profile`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (response.ok) {
                    this.currentUser = await response.json();
                    
                    const userDetailsFields = this.shadowRoot.getElementById('user-details-fields');
                    userDetailsFields.style.display = 'none';


                    userDetailsFields.querySelectorAll('input').forEach(input => {
                        input.removeAttribute('required');
                    });
                    
                    this.messageContainer.textContent = `Reservando como ${this.currentUser.name}.`;
                    this.messageContainer.className = 'confirmation-message info';
                }
            } catch (error) {
                console.log("Token inválido, se mostrará el formulario completo.");
            }
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        const submitButton = this.form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';

        const reservationData = {
            guest_count: parseInt(this.form.guests.value, 10),
            reservation_date: new Date(`${this.form.date.value}T${this.form.time.value}`)
        };

        if (!this.currentUser) {
            reservationData.name = this.form.name.value;
            reservationData.contact_info = `Tel: ${this.form.phone.value}, Email: ${this.form.email.value}`;
        }
        
        try {
            const response = await fetch(`${this.API_BASE_URL}/reservations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...this.currentUser && { 'Authorization': `Bearer ${localStorage.getItem('sushi_token')}` } },
                body: JSON.stringify(reservationData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'No se pudo crear la reserva.');
            }

            this.messageContainer.textContent = 'Tu solicitud de reserva ha sido enviada con éxito';
            this.messageContainer.className = 'confirmation-message success';
            this.form.reset();
        } catch (error) {
            this.messageContainer.textContent = `Error: ${error.message}`;
            this.messageContainer.className = 'confirmation-message error';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Reserve';
        }
    }

    disconnectedCallback() {
        if(this.form) this.form.removeEventListener('submit', this.handleSubmit);
    }
}

customElements.define('reservations-page', ReservationsPage);