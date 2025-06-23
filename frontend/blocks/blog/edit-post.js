import { blogApi } from '../utils/api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('create-post-form');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const imageUploaderGroup = document.getElementById('image-uploader-container')?.closest('.form-group');

    if(imageUploaderGroup) {
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
        const post = await blogApi.getById(postId);
        titleInput.value = post.title;
        contentInput.value = post.content;
    } catch (error) {
        console.error('Error al cargar los datos del post:', error);
        alert('No se pudieron cargar los datos para editar.');
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const updatedData = {
            title: titleInput.value,
            content: contentInput.value
        };

        try {
            await blogApi.update(postId, updatedData);
            alert('Publicación actualizada exitosamente');
            window.location.href = `blog-single.html?id=${postId}`;
        } catch (error) {
            console.error('Error al actualizar el post:', error);
            alert(`Error: ${error.message}`);
        }
    });
});