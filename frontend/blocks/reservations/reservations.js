document.addEventListener('DOMContentLoaded', () => {
    const reservationForm = document.getElementById('reservation-form');

    const messageContainer = document.createElement('div');
    messageContainer.className = 'confirmation-message';
    reservationForm.after(messageContainer);

    if (reservationForm) {
        reservationForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const submitButton = reservationForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando.....';
            messageContainer.textContent = '';

            try {
                const name = document.getElementById('name').value;
                const phone = document.getElementById('phone').value;
                const email = document.getElementById('email').value;
                const guests = document.getElementById('guests').value;
                const date = document.getElementById('date').value;
                const time = document.getElementById('time').value;

                const contact_info = `Tel: ${phone}, Email: ${email}`;
                const reservation_date = new Date(`${date}T${time}`);

                const reservationData = {
                    name,
                    contact_info,
                    reservation_date,
                    guest_count: parseInt(guests, 10)
                };

                const response = await fetch('http://localhost:3000/api/reservations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(reservationData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'No se pudo enviar la solicitud.');
                }

                messageContainer.textContent = 'Tu solicitud ha sido enviada. Te contactaremos pronto.';
                messageContainer.classList.add('success');
                messageContainer.classList.remove('error');
                reservationForm.reset();

            } catch (error) {
                console.error('Error al enviar la reserva:', error);
                messageContainer.textContent = `Error: ${error.message}`;
                messageContainer.classList.add('error');
                messageContainer.classList.remove('success');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Reserve';
            }
        });
    }
});