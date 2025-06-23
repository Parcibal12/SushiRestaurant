import { blogApi, authApi } from '../utils/api.js';

async function setupActions(post) {
    console.log('Paso A: Entrando a la función setupActions. El post que se está viendo tiene authorId:', post.authorId);

    const token = localStorage.getItem('sushi_token');
    if (!token) {
        console.log('Paso B: Fallo. No se encontró ningún token en localStorage. El usuario no está logueado.');
        return; 
    }
    console.log('Paso B: Token encontrado en localStorage. Procediendo...');

    try {
        console.log('Paso C: Intentando obtener el perfil del usuario desde la API...');
        const currentUser = await authApi.getProfile();
        console.log('Paso D: Perfil obtenido de la API. El ID del usuario actual es:', currentUser.id);

        console.log(`Paso E: Comparando... ID de usuario actual (<span class="math-inline">\{currentUser\.id\}\) vs ID del autor del post \(</span>{post.authorId})`);

        if (currentUser.id === post.authorId) {
            console.log('Paso F: ¡ÉXITO! Los IDs coinciden. Se mostrarán los botones.');
            const actionsContainer = document.getElementById('post-actions');
            if (actionsContainer) {
                actionsContainer.style.display = 'flex';
            } else {
                console.error('Error Crítico: No se encontró el div con id="post-actions" en el HTML.');
            }
        } else {
            console.log('Paso F: FALLO. Los IDs no coinciden.');
        }
    } catch (error) {
        console.error('Paso G: Ocurrió un error al verificar la autorización:', error.message);
    }
}

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
        
        await setupActions(post);

    } catch (error) {
        console.error('Error al cargar el post:', error);
        if (titleElement) titleElement.textContent = 'Post no encontrado...';
        if (bodyElement) bodyElement.innerHTML = `<p>El artículo que estás buscando no existe o ha sido removido.</p>`;
    }
});