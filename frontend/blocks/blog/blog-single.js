import { blogApi, authApi } from '../utils/api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const titleElement = document.getElementById('post-title');
    const dateElement = document.getElementById('post-date');
    const authorElement = document.getElementById('post-author');
    const bodyElement = document.getElementById('post-body');
    const bannerImageElement = document.getElementById('post-banner-image');
    
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!postId) {
        document.body.innerHTML = '<h1>Error: ID de post no encontrado.</h1>';
        return;
    }

    try {
        const post = await blogApi.getById(postId);

        document.title = `${post.title} - Qitchen`;
        if (bannerImageElement) bannerImageElement.src = post.imageUrl || '/assets/blog/blog-default.png';
        if (titleElement) titleElement.textContent = post.title;
        if (dateElement) dateElement.textContent = new Date(post.createdAt).toLocaleDateString('es-ES', { dateStyle: 'long' });
        if (authorElement) authorElement.textContent = `Autor: ${post.author ? post.author.name : 'Anónimo'}`;
        if (bodyElement) bodyElement.textContent = post.content;
        
    } catch (error) {
        console.error('Error al cargar el post:', error);
        if (titleElement) titleElement.textContent = 'Post no encontrado...';
        if (bodyElement) bodyElement.innerHTML = `<p>El artículo que estás buscando no existe o ha sido removido.</p>`;
    }
});