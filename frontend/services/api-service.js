const API_BASE_URL = 'http://localhost:3000/api';

function getAuthHeaders() {
    const token = localStorage.getItem('sushi_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function getProfile() {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, { headers: getAuthHeaders() });
    if (!response.ok) return null;
    return response.json();
}

async function getBlogPosts(filter = 'all') {
    let endpoint = '/blog';
    if (filter === 'my-articles') endpoint = '/blog/my-posts';
    if (filter === 'favorites') endpoint = '/blog/my-favorites';
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Error al cargar los posts.');
    return response.json();
}

async function getBlogPostById(postId) {
    const response = await fetch(`${API_BASE_URL}/blog/${postId}`);
    if (!response.ok) throw new Error('Post no encontrado.');
    return response.json();
}

async function createBlogPost(formData) {
    const response = await fetch(`${API_BASE_URL}/blog`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el post.');
    }
    return response.json();
}

async function updateBlogPost(postId, updatedData) {
    const response = await fetch(`${API_BASE_URL}/blog/${postId}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el post.');
    }
    return response.json();
}

async function deleteBlogPost(postId) {
    const response = await fetch(`${API_BASE_URL}/blog/${postId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al eliminar el post.');
}

async function likeBlogPost(postId) {
    const response = await fetch(`${API_BASE_URL}/blog/${postId}/like`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al dar like.');
    }
    return response.json();
}

export const ApiService = {
    getProfile,
    getBlogPosts,
    getBlogPostById,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    likeBlogPost,
};