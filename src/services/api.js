// src/services/api.js - Perbaiki response interceptor
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        headers: config.headers
        });
        return config;
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
    );

    // Response interceptor - PERBAIKAN
    api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        data: response.data
        });
        
        // Check for success response structure
        if (response.data && typeof response.data === 'object') {
        return response;
        }
        
        console.warn('⚠️ Unexpected response structure:', response.data);
        return response;
    },
    (error) => {
        console.error('❌ API Response Error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        data: error.response?.data
        });

        // Handle specific status codes
        if (error.response?.status === 401) {
        // Handle unauthorized
        console.log('🚪 Unauthorized - clearing auth data');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-storage');
        
        // Only redirect if not already on auth pages
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register') && 
            !window.location.pathname.includes('/verify-email')) {
            window.location.href = '/login';
        }
        } else if (error.response?.status >= 500) {
        toast.error('Terjadi kesalahan server. Silakan coba lagi.');
        }
        
        return Promise.reject(error);
    }
);

export default api;