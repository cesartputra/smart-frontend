// src/services/suratPengantarService.js - UPDATED dengan admin endpoints
import api from './api';

const suratPengantarService = {
    // Get categories
    getCategories: async () => {
        console.log('SuratPengantarService.getCategories called');
        try {
            const response = await api.get('/api/surat-pengantar/categories');
            console.log('GetCategories response:', response.data);
            return response.data;
        } catch (error) {
            console.error('SuratPengantarService.getCategories error:', error);
            throw error;
        }
    },

    // Create surat pengantar request
    createRequest: async (data) => {
        console.log('SuratPengantarService.createRequest called with:', data);
        try {
            const response = await api.post('/api/surat-pengantar', data);
            console.log('CreateRequest response:', response.data);
            return response.data;
        } catch (error) {
            console.error('SuratPengantarService.createRequest error:', error);
            throw error;
        }
    },

    // Get my requests
    getMyRequests: async (params = {}) => {
        console.log('SuratPengantarService.getMyRequests called with:', params);
        try {
            const response = await api.get('/api/surat-pengantar/my-requests', { params });
            console.log('GetMyRequests response:', response.data);
            return response.data;
        } catch (error) {
            console.error('SuratPengantarService.getMyRequests error:', error);
            throw error;
        }
    },

    // Get surat pengantar detail
    getDetail: async (id) => {
        console.log('SuratPengantarService.getDetail called with id:', id);
        try {
            const response = await api.get(`/api/surat-pengantar/${id}`);
            console.log('GetDetail response:', response.data);
            return response.data;
        } catch (error) {