/**
 * api/client.ts
 * 
 * Set up AXIOS instance that all API calls use.
 * "Interceptor" automatically attaches JWT from localStorage to every request
 */

import axios from "axios";

const apiClient = axios.create({
    baseURL: '/',   // Vite will forward /dogs and /auth to backend
});

// ----- REQUEST INTERCEPTOR -----
// Check if JWT token is stored in local storage before every request and inject it

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('auth:logout'));
        }
        return Promise.reject(error);
    }
);

export default apiClient;