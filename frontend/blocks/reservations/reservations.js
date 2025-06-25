import { reservationsApi, authApi } from '../utils/api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const reservationForm = document.getElementById('reservation-form');
    const nameGroup = document.getElementById('name').closest('.form-group');
    const phoneGroup = document.getElementById('phone').closest('.form-group');
    const emailGroup = document.getElementById('email').closest('.form-group');
    const messageContainer = document.createElement('div');
    messageContainer.className = 'confirmation-message';
    reservationForm.before(messageContainer);

    let currentUser = null;

    const token = localStorage.getItem('sushi_token');
    if (token) {
        try {
            currentUser = await authApi.getProfile();
            if (currentUser) {
                nameGroup.style.display = 'none';
                phoneGroup.style.display = 'none';
                emailGroup.style.display = 'none';
                messageContainer.textContent = `Reservando como ${currentUser.name}.`;
                messageContainer.className = 'confirmation-message info';
            }
        } catch (error) {
            console.log("Token inválido o expirado, se mostrará el formulario completo.");
        }
    }

    if (reservationForm) {
        reservationForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const submitButton = reservationForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando....';

            const reservationData = {
                guest_count: parseInt(document.getElementById('guests').value, 10),
                reservation_date: new Date(`${document.getElementById('date').value}T${document.getElementById('time').value}`)
            };

            if (!currentUser) {
                reservationData.name = document.getElementById('name').value;
                reservationData.contact_info = `Tel: ${document.getElementById('phone').value}, Email: ${document.getElementById('email').value}`;
            }

            try {
                await reservationsApi.create(reservationData);
                
                messageContainer.textContent = 'Tu solicitud ha sido enviada.';
                messageContainer.className = 'confirmation-message success';
                reservationForm.reset();
            } catch (error) {
                messageContainer.textContent = `Error: ${error.message}`;
                messageContainer.className = 'confirmation-message error';
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Reserve';
            }
        });
    }
});