document.addEventListener('DOMContentLoaded', () => {

    const userDetailsSection = document.querySelector('.reservation-form__user-details');
    if (!userDetailsSection) return;

    const authToken = localStorage.getItem('authToken');

    if (authToken) {
        userDetailsSection.classList.add('hidden');
    } else {
        userDetailsSection.classList.remove('hidden');
    }

    const form = document.getElementById('reservation-form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        console.log('Formulario de reserva enviado (lógica pendiente).');
    });
});