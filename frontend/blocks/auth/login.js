document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.auth-form');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            alert('Por favor, introduce email y contraseña.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al iniciar sesión.');
            }


            localStorage.setItem('sushi_token', data.token);

            alert('Inicio de sesión exitoso');
            window.location.href = '/frontend/index.html'; 

        } catch (error) {
            alert(error.message);
        }
    });
});