document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('create-post-form');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const imageUploaderGroup = document.getElementById('image-uploader-container')?.closest('.form-group');
    const API_BASE_URL = 'http://localhost:3000/api';

    if (imageUploaderGroup) {
        imageUploaderGroup.style.display = 'none';
    }

    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!postId) {
        alert('ID de post no válido.');
        window.location.href = 'blog.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/blog/${postId}`);
        if (!response.ok) throw new Error('No se pudo cargar el post.');
        const post = await response.json();
        
        titleInput.value = post.title;
        contentInput.value = post.content;
    } catch (error) {
        console.error('Error al cargar datos para editar:', error);
        alert('No se pudieron cargar los datos para editar.');
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const updatedData = {
            title: titleInput.value,
            content: contentInput.value
        };
        const token = localStorage.getItem('sushi_token');

        try {
            const response = await fetch(`${API_BASE_URL}/blog/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }
            alert('¡Publicación actualizada!');
            window.location.href = `blog-single.html?id=${postId}`;
        } catch (error) {
            alert(`Error al actualizar: ${error.message}`);
        }
    });
});