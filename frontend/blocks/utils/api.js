const BASE_URL = 'http://localhost:3000/api';

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
        const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Error del servidor: ${response.statusText}` }));
            throw new Error(errorData.message || 'Error en la petición a la API');
        }

        const contentLength = response.headers.get('content-length');
        if (response.status === 204 || contentLength === '0') {
            return;
        }

        return response.json();

    } catch (error) {
        console.error('Error en la función de request:', error);
        throw error;
    }
}

export const blogApi = {
    getAll: () => request('/blog'),
    getMyPosts: () => request('/blog/my-posts'),
    getById: (id) => request(`/blog/${id}`),
    create: (formData) => request('/blog', { method: 'POST', body: formData }),
    update: (id, postData) => request(`/blog/${id}`, { method: 'PUT', body: JSON.stringify(postData) }),
    delete: (id) => request(`/blog/${id}`, { method: 'DELETE' }),
};

export const authApi = {
    getProfile: () => request('/auth/profile'),
};

export const productsApi = {
    getAll: () => request('/products'),
};