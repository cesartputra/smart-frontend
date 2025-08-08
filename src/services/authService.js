// src/services/authService.js - Tambah logging untuk debug
import api from './api';

const authService = {
    // Sign Up
    signUp: async (data) => {
        console.log('AuthService.signUp called with:', data);
        try {
        const response = await api.post('/api/auth/signup', data);
        console.log('SignUp response:', response);
        return response.data;
        } catch (error) {
        console.error('AuthService.signUp error:', error);
        throw error;
        }
    },

    // Sign In
    signIn: async (credentials) => {
        console.log('AuthService.signIn called with:', credentials);
        try {
        const response = await api.post('/api/auth/signin', credentials);
        console.log('SignIn response:', response);
        return response.data;
        } catch (error) {
        console.error('AuthService.signIn error:', error);
        throw error;
        }
    },

    // Verify Email dengan detailed logging
    verifyEmail: async (token) => {
        console.log('🔍 AuthService.verifyEmail called with token:', token);
        try {
        const response = await api.get(`/api/auth/verify-email/${token}`);
        console.log('✅ VerifyEmail SUCCESS response:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            headers: response.headers
        });
        return response.data;
        } catch (error) {
        console.error('❌ AuthService.verifyEmail error:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            config: error.config
        });
        throw error;
        }
    },

    // Resend Verification
    resendVerification: async (email) => {
        console.log('AuthService.resendVerification called with email:', email);
        try {
        const response = await api.post('/api/auth/resend-verification', { email });
        console.log('ResendVerification response:', response);
        return response.data;
        } catch (error) {
        console.error('AuthService.resendVerification error:', error);
        throw error;
        }
    },

    // Refresh Token
    refreshToken: async (refreshToken) => {
        try {
        const response = await api.post('/api/auth/refresh-token', { refreshToken });
        return response.data;
        } catch (error) {
        console.error('AuthService.refreshToken error:', error);
        throw error;
        }
    },

    // Get Profile
    getProfile: async () => {
        try {
        const response = await api.get('/api/auth/profile');
        return response.data;
        } catch (error) {
        console.error('AuthService.getProfile error:', error);
        throw error;
        }
    },
};

export default authService;