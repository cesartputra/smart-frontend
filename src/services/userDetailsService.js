// src/services/userDetailsService.js
import api from './api';

const userDetailsService = {
    // Create user details
    createUserDetails: async (data) => {
        console.log('UserDetailsService.createUserDetails called with:', data);
        try {
            const response = await api.post('/api/user-details', data);
            console.log('CreateUserDetails response:', response.data);
            return response.data;
        } catch (error) {
            console.error('UserDetailsService.createUserDetails error:', error);
            throw error;
        }
    },

    // Get user details
    getUserDetails: async () => {
        try {
            const response = await api.get('/api/user-details');
            console.log('GetUserDetails response:', response.data);
            return response.data;
        } catch (error) {
            console.error('UserDetailsService.getUserDetails error:', error);
            throw error;
        }
    },

    // Update user details
    updateUserDetails: async (data) => {
        console.log('UserDetailsService.updateUserDetails called with:', data);
        try {
            const response = await api.patch('/api/user-details', data);
            console.log('UpdateUserDetails response:', response.data);
            return response.data;
        } catch (error) {
            console.error('UserDetailsService.updateUserDetails error:', error);
            throw error;
        }
    },
};

export default userDetailsService;