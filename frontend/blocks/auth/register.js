document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('.auth-form');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en el registro.');
            }

            alert('Registro exitoso. Ahora puedes iniciar sesión.');
            window.location.href = 'login.html';

        } catch (error) {
            alert(error.message);
        }
    });
});