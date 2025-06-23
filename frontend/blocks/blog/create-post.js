document.addEventListener('DOMContentLoaded', () => {
    const createPostForm = document.getElementById('create-post-form');
    const imageUploader = document.getElementById('image-uploader'); 
    const imageInput = document.getElementById('image-upload');
    const imagePreviewContainer = document.getElementById('image-preview');

    
    imageUploader.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreviewContainer.innerHTML = `<img src="${e.target.result}" alt="Vista previa de la imagen">`;
            };
            reader.readAsDataURL(file);
        }
    });


    createPostForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const imageFile = imageInput.files[0];
        const token = localStorage.getItem('sushi_token');

        if (!title || !content) {
            return alert('El título y el contenido son obligatorios.');
        }
        if (!imageFile) {
            return alert('Por favor selecciona una imagen para la publicación.');
        }
        if (!token) {
            alert('Debes iniciar sesión para crear una publicación.');
            window.location.href = '/frontend/blocks/auth/login.html';
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('image', imageFile);

        try {
            const response = await fetch('http://localhost:3000/api/blog', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData, 
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear el post.');
            }

            alert('Publicación creada');
            window.location.href = 'blog.html';

        } catch (error) {
            alert(error.message);
            console.error(error);
        }
    });
});