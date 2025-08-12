// src/services/suratPengantarService.js
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
            console.error('SuratPengantarService.getDetail error:', error);
            throw error;
        }
    },

    // Download PDF
    downloadPDF: async (id) => {
        console.log('SuratPengantarService.downloadPDF called with id:', id);
        try {
            const response = await api.get(`/api/surat-pengantar/${id}/download`, {
                responseType: 'blob'
            });
            console.log('DownloadPDF response received');
            return response;
        } catch (error) {
            console.error('SuratPengantarService.downloadPDF error:', error);
            throw error;
        }
    },

    // RT Management
    getPendingForRT: async (params = {}) => {
        console.log('SuratPengantarService.getPendingForRT called with:', params);
        try {
            const response = await api.get('/api/surat-pengantar/rt/pending', { params });
            console.log('GetPendingForRT response:', response.data);
            return response.data;
        } catch (error) {
            console.error('SuratPengantarService.getPendingForRT error:', error);
            throw error;
        }
    },

    rtApproval: async (id, data) => {
        console.log('SuratPengantarService.rtApproval called with:', { id, data });
        try {
            const response = await api.patch(`/api/surat-pengantar/${id}/rt-approval`, data);
            console.log('RTApproval response:', response.data);
            return response.data;
        } catch (error) {
            console.error('SuratPengantarService.rtApproval error:', error);
            throw error;
        }
    },

    getRTStatistics: async (params = {}) => {
        console.log('SuratPengantarService.getRTStatistics called with:', params);
        try {
            const response = await api.get('/api/surat-pengantar/rt/statistics', { params });
            console.log('GetRTStatistics response:', response.data);
            return response.data;
        } catch (error) {
            console.error('SuratPengantarService.getRTStatistics error:', error);
            throw error;
        }
    },

    // RW Management
    getPendingForRW: async (params = {}) => {
        console.log('SuratPengantarService.getPendingForRW called with:', params);
        try {
            const response = await api.get('/api/surat-pengantar/rw/pending', { params });
            console.log('GetPendingForRW response:', response.data);
            return response.data;
        } catch (error) {
            console.error('SuratPengantarService.getPendingForRW error:', error);
            throw error;
        }
    },

    rwApproval: async (id, data) => {
        console.log('SuratPengantarService.rwApproval called with:', { id, data });
        try {
            const response = await api.patch(`/api/surat-pengantar/${id}/rw-approval`, data);
            console.log('RWApproval response:', response.data);
            return response.data;
        } catch (error) {
            console.error('SuratPengantarService.rwApproval error:', error);
            throw error;
        }
    },

    getRWStatistics: async (params = {}) => {
        console.log('SuratPengantarService.getRWStatistics called with:', params);
        try {
            const response = await api.get('/api/surat-pengantar/rw/statistics', { params });
            console.log('GetRWStatistics response:', response.data);
            return response.data;
        } catch (error) {
            console.error('SuratPengantarService.getRWStatistics error:', error);
            throw error;
        }
    },

    // Admin Management
    getAdminStatistics: async (params = {}) => {
        console.log('SuratPengantarService.getAdminStatistics called with:', params);
        try {
            const response = await api.get('/api/surat-pengantar/admin/statistics', { params });
            console.log('GetAdminStatistics response:', response.data);
            return response.data;
        } catch (error) {
            console.error('SuratPengantarService.getAdminStatistics error:', error);
            throw error;
        }
    },

    // QR Code verification (public)
    verifyQRCode: async (token) => {
        console.log('SuratPengantarService.verifyQRCode called with token:', token);
        try {
            // Use direct fetch for public endpoint without auth headers
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/verify-surat/${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            console.log('VerifyQRCode response:', data);
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to verify QR code');
            }
            
            return data;
        } catch (error) {
            console.error('SuratPengantarService.verifyQRCode error:', error);
            throw error;
        }
    }
};

export default suratPengantarService;