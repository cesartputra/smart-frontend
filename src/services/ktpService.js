// src/services/ktpService.js
import api from './api';

const ktpService = {
    // Create/Claim KTP
    createKTP: async (data) => {
        console.log('KTPService.createKTP called with:', data);
        try {
        const response = await api.post('/api/user-ktp', data);
        console.log('CreateKTP response:', response.data);
        return response.data;
        } catch (error) {
        console.error('KTPService.createKTP error:', error);
        throw error;
        }
    },

    // Get user's KTP
    getKTP: async () => {
        try {
        const response = await api.get('/api/user-ktp');
        return response.data;
        } catch (error) {
        console.error('KTPService.getKTP error:', error);
        throw error;
        }
    },

    // Check NIK claimability
    checkNikClaimability: async (nik) => {
        try {
        const response = await api.get(`/api/user-ktp/check-claim/${nik}`);
        return response.data;
        } catch (error) {
        console.error('KTPService.checkNikClaimability error:', error);
        throw error;
        }
    },

    // Update KTP
    updateKTP: async (data) => {
        try {
        const response = await api.patch('/api/user-ktp', data);
        return response.data;
        } catch (error) {
        console.error('KTPService.updateKTP error:', error);
        throw error;
        }
    },

    // Get unclaimed family members
    getUnclaimedMembers: async () => {
        try {
        const response = await api.get('/api/user-ktp/unclaimed-members');
        return response.data;
        } catch (error) {
        console.error('KTPService.getUnclaimedMembers error:', error);
        throw error;
        }
    }
};

export default ktpService;