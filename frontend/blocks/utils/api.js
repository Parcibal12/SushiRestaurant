const API_BASE_URL = 'http://localhost:3000/api';


async function request(endpoint, options = {}) {
    const token = localStorage.getItem('sushi_token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Ocurrió un error en la API');
        }

        if (response.status === 204) return null;
        
        return response.json();
    } catch (error) {
        console.error(`Error en la petición a ${endpoint}:`, error);
        throw error;
    }
}

export const blogApi = {
    getAll: () => request('/blog'),
    getMyPosts: () => request('/blog/my-posts'),
    getMyFavorites: () => request('/blog/my-favorites'),
    toggleLike: (postId) => request(`/blog/${postId}/like`, { method: 'POST' }),
    getById: (id) => request(`/blog/${id}`),
};

export const authApi = {
    getProfile: () => request('/auth/profile'),
};

