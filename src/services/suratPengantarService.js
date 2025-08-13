// src/services/SuratPengantarService.js - REFACTORED VERSION
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

    // Get my requests - REFACTORED dengan proper validation
    getMyRequests: async (params = {}) => {
        console.log('SuratPengantarService.getMyRequests called with:', params);
        
        // Validate parameters sesuai dengan backend validation
        const validatedParams = {};
        
        // Validate page parameter
        if (params.page !== undefined) {
            const page = parseInt(params.page);
            if (isNaN(page) || page < 1) {
                throw new Error('Page must be a positive integer');
            }
            validatedParams.page = page;
        }
        
        // Validate limit parameter  
        if (params.limit !== undefined) {
            const limit = parseInt(params.limit);
            if (isNaN(limit) || limit < 1 || limit > 100) {
                throw new Error('Limit must be between 1-100');
            }
            validatedParams.limit = limit;
        }
        
        // Validate status parameter
        if (params.status) {
            const validStatuses = ['DRAFT', 'SUBMITTED', 'RT_APPROVED', 'RW_APPROVED', 'COMPLETED', 'REJECTED'];
            if (!validStatuses.includes(params.status)) {
                throw new Error('Invalid status. Must be one of: ' + validStatuses.join(', '));
            }
            validatedParams.status = params.status;
        }

        // Add other optional filters
        if (params.search && params.search.trim()) {
            validatedParams.search = params.search.trim();
        }

        if (params.categoryId) {
            const categoryId = parseInt(params.categoryId);
            if (!isNaN(categoryId)) {
                validatedParams.categoryId = categoryId;
            }
        }

        if (params.sortBy) {
            validatedParams.sortBy = params.sortBy;
        }

        if (params.sortOrder && ['asc', 'desc'].includes(params.sortOrder.toLowerCase())) {
            validatedParams.sortOrder = params.sortOrder.toLowerCase();
        }

        try {
            const response = await api.get('/api/surat-pengantar/my-requests', { 
                params: validatedParams 
            });
            console.log('GetMyRequests response:', response.data);
            return response.data;
        } catch (error) {
            console.error('SuratPengantarService.getMyRequests error:', error);
            
            // Handle specific validation errors from backend
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message || 'Invalid request parameters';
                throw new Error(errorMessage);
            }
            
            throw error;
        }
    },

    // Get surat pengantar detail
    getDetail: async (id) => {
        console.log('SuratPengantarService.getDetail called with id:', id);
        
        if (!id || typeof id !== 'string') {
            throw new Error('Invalid ID parameter');
        }
        
        try {
            const response = await api.get(`/api/surat-pengantar/${id}`);
            console.log('GetDetail response:', response.data);
            return response.data;
        } catch (error) {
            console.error('SuratPengantarService.getDetail error:', error);
            
            if (error.response?.status === 404) {
                throw new Error('Surat pengantar tidak ditemukan');
            }
            
            throw error;
        }
    },

    // Download PDF
    downloadPDF: async (id) => {
        console.log('SuratPengantarService.downloadPDF called with id:', id);
        
        if (!id || typeof id !== 'string') {
            throw new Error('Invalid ID parameter');
        }
        
        try {
            const response = await api.get(`/api/surat-pengantar/${id}/download`, {
                responseType: 'blob'
            });
            console.log('DownloadPDF response received');
            return response;
        } catch (error) {
            console.error('SuratPengantarService.downloadPDF error:', error);
            
            if (error.response?.status === 404) {
                throw new Error('File PDF tidak ditemukan');
            }
            
            if (error.response?.status === 403) {
                throw new Error('Anda tidak memiliki akses untuk mengunduh file ini');
            }
            
            throw error;
        }
    },

    // RT Management
    getPendingForRT: async (params = {}) => {
        console.log('SuratPengantarService.getPendingForRT called with:', params);
        
        const validatedParams = {};
        
        if (params.page !== undefined) {
            const page = parseInt(params.page);
            if (isNaN(page) || page < 1) {
                throw new Error('Page must be a positive integer');
            }
            validatedParams.page = page;
        }
        
        if (params.limit !== undefined) {
            const limit = parseInt(params.limit);
            if (isNaN(limit) || limit < 1 || limit > 100) {
                throw new Error('Limit must be between 1-100');
            }
            validatedParams.limit = limit;
        }
        
        try {
            const response = await api.get('/api/surat-pengantar/rt/pending', { 
                params: validatedParams 
            });
            console.log('GetPendingForRT response:', response.data);
            return response.data;
        } catch (error) {
            console.error('SuratPengantarService.getPendingForRT error:', error);
            throw error;
        }
    },

    rtApproval: async (id, data) => {
        console.log('SuratPengantarService.rtApproval called with:', { id, data });
        
        if (!id || typeof id !== 'string') {
            throw new Error('Invalid ID parameter');
        }
        
        if (!data || !data.action || !['A', 'R'].includes(data.action)) {
            throw new Error('Action must be either "A" (approve) or "R" (reject)');
        }
        
        if (data.action === 'R' && (!data.notes || !data.notes.trim())) {
            throw new Error('Notes are required for rejection');
        }
        
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
        
        const validatedParams = {};
        
        if (params.period && ['week', 'month', 'quarter', 'year'].includes(params.period)) {
            validatedParams.period = params.period;
        }
        
        if (params.startDate) {
            validatedParams.startDate = params.startDate;
        }
        
        if (params.endDate) {
            validatedParams.endDate = params.endDate;
        }
        
        try {
            const response = await api.get('/api/surat-pengantar/rt/statistics', { 
                params: validatedParams 
            });
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
        
        const validatedParams = {};
        
        if (params.page !== undefined) {
            const page = parseInt(params.page);
            if (isNaN(page) || page < 1) {
                throw new Error('Page must be a positive integer');
            }
            validatedParams.page = page;
        }
        
        if (params.limit !== undefined) {
            const limit = parseInt(params.limit);
            if (isNaN(limit) || limit < 1 || limit > 100) {
                throw new Error('Limit must be between 1-100');
            }
            validatedParams.limit = limit;
        }
        
        try {
            const response = await api.get('/api/surat-pengantar/rw/pending', { 
                params: validatedParams 
            });
            console.log('GetPendingForRW response:', response.data);
            return response.data;
        } catch (error) {
            console.error('SuratPengantarService.getPendingForRW error:', error);
            throw error;
        }
    },

    rwApproval: async (id, data) => {
        console.log('SuratPengantarService.rwApproval called with:', { id, data });
        
        if (!id || typeof id !== 'string') {
            throw new Error('Invalid ID parameter');
        }
        
        if (!data || !data.action || !['A', 'R'].includes(data.action)) {
            throw new Error('Action must be either "A" (approve) or "R" (reject)');
        }
        
        if (data.action === 'R' && (!data.notes || !data.notes.trim())) {
            throw new Error('Notes are required for rejection');
        }
        
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
        
        const validatedParams = {};
        
        if (params.period && ['week', 'month', 'quarter', 'year'].includes(params.period)) {
            validatedParams.period = params.period;
        }
        
        if (params.startDate) {
            validatedParams.startDate = params.startDate;
        }
        
        if (params.endDate) {
            validatedParams.endDate = params.endDate;
        }
        
        try {
            const response = await api.get('/api/surat-pengantar/rw/statistics', { 
                params: validatedParams 
            });
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
        
        const validatedParams = {};
        
        if (params.period && ['week', 'month', 'quarter', 'year'].includes(params.period)) {
            validatedParams.period = params.period;
        }
        
        if (params.rwId) {
            const rwId = parseInt(params.rwId);
            if (!isNaN(rwId)) {
                validatedParams.rwId = rwId;
            }
        }
        
        if (params.rtId) {
            const rtId = parseInt(params.rtId);
            if (!isNaN(rtId)) {
                validatedParams.rtId = rtId;
            }
        }
        
        if (params.status) {
            const validStatuses = ['DRAFT', 'SUBMITTED', 'RT_APPROVED', 'RW_APPROVED', 'COMPLETED', 'REJECTED'];
            if (validStatuses.includes(params.status)) {
                validatedParams.status = params.status;
            }
        }
        
        try {
            const response = await api.get('/api/surat-pengantar/admin/statistics', { 
                params: validatedParams 
            });
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
        
        if (!token || typeof token !== 'string') {
            throw new Error('Invalid verification token');
        }
        
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
