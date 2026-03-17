/**
 * api/client.ts
 * 
 * Set up Axios instance that all API calls use.
 * Axios intercepters are called before and after each request to the backend.
 */

import axios from "axios";

const apiClient = axios.create({
    baseURL: '/',   // Vite proxy will forward /dogs and /auth to backend
});

// ----- REQUEST INTERCEPTOR -----
// Before every request to the backend, check if the user is logged in and has a JWT.
// if they do, add it to the request's authorization header then make the request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// On every request response, check if the user tried to access a resource without being authorized
// if user is unauthorized, remove their jwt from local storage
apiClient.interceptors.response.use(
    (response) => response, // regular response
    (error) => {            // error 401, user unauthorized
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('auth:logout'));
        }
        return Promise.reject(error);
    }
);

export default apiClient;