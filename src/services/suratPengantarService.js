// src/services/suratPengantarService.js - DEBUG VERSION
import api from './api';

const suratPengantarService = {
    // Get categories
    getCategories: async () => {
        console.log('🔧 suratPengantarService.getCategories called');
        try {
            const response = await api.get('/api/surat-pengantar/categories');
            console.log('✅ GetCategories response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ suratPengantarService.getCategories error:', error);
            console.error('❌ Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    },

    // Create surat pengantar request
    createRequest: async (data) => {
        console.log('🔧 suratPengantarService.createRequest called with:', data);
        try {
            const response = await api.post('/api/surat-pengantar', data);
            console.log('✅ CreateRequest response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ suratPengantarService.createRequest error:', error);
            throw error;
        }
    },

    // Get my requests - ENHANCED dengan debugging
    getMyRequests: async (params = {}) => {
        console.log('🔧 suratPengantarService.getMyRequests called with:', params);
        console.log('🔧 Params type:', typeof params);
        console.log('🔧 Params keys:', Object.keys(params));
        
        // Validate parameters sesuai dengan backend validation
        const validatedParams = {};
        
        // Validate page parameter
        if (params.page !== undefined) {
            const page = parseInt(params.page);
            console.log('🔧 Page validation:', { original: params.page, parsed: page, isValid: !isNaN(page) && page >= 1 });
            if (isNaN(page) || page < 1) {
                const error = new Error('Page must be a positive integer');
                console.error('❌ Page validation failed:', error.message);
                throw error;
            }
            validatedParams.page = page;
        }
        
        // Validate limit parameter  
        if (params.limit !== undefined) {
            const limit = parseInt(params.limit);
            console.log('🔧 Limit validation:', { original: params.limit, parsed: limit, isValid: !isNaN(limit) && limit >= 1 && limit <= 100 });
            if (isNaN(limit) || limit < 1 || limit > 100) {
                const error = new Error('Limit must be between 1-100');
                console.error('❌ Limit validation failed:', error.message);
                throw error;
            }
            validatedParams.limit = limit;
        }
        
        // Validate status parameter
        if (params.status) {
            const validStatuses = ['DRAFT', 'SUBMITTED', 'RT_APPROVED', 'RW_APPROVED', 'COMPLETED', 'REJECTED'];
            console.log('🔧 Status validation:', { original: params.status, isValid: validStatuses.includes(params.status) });
            if (!validStatuses.includes(params.status)) {
                const error = new Error('Invalid status. Must be one of: ' + validStatuses.join(', '));
                console.error('❌ Status validation failed:', error.message);
                throw error;
            }
            validatedParams.status = params.status;
        }

        // Add other optional filters
        if (params.search && params.search.trim()) {
            validatedParams.search = params.search.trim();
            console.log('🔧 Search param added:', validatedParams.search);
        }

        if (params.categoryId) {
            const categoryId = parseInt(params.categoryId);
            if (!isNaN(categoryId)) {
                validatedParams.categoryId = categoryId;
                console.log('🔧 CategoryId param added:', validatedParams.categoryId);
            }
        }

        if (params.sortBy) {
            validatedParams.sortBy = params.sortBy;
            console.log('🔧 SortBy param added:', validatedParams.sortBy);
        }

        if (params.sortOrder && ['asc', 'desc'].includes(params.sortOrder.toLowerCase())) {
            validatedParams.sortOrder = params.sortOrder.toLowerCase();
            console.log('🔧 SortOrder param added:', validatedParams.sortOrder);
        }

        console.log('🔧 Final validated params:', validatedParams);

        try {
            console.log('🔧 Making API call to /api/surat-pengantar/my-requests');
            console.log('🔧 Request URL will be constructed with params:', validatedParams);
            
            const response = await api.get('/api/surat-pengantar/my-requests', { 
                params: validatedParams 
            });
            
            console.log('✅ GetMyRequests RAW response:', response);
            console.log('✅ Response status:', response.status);
            console.log('✅ Response headers:', response.headers);
            console.log('✅ Response data:', response.data);
            console.log('✅ Response data type:', typeof response.data);
            console.log('✅ Response data keys:', Object.keys(response.data || {}));
            
            // Deep inspection of response structure
            if (response.data) {
                console.log('🔍 Deep inspection of response.data:');
                
                if (response.data.success !== undefined) {
                    console.log('  - Has success field:', response.data.success);
                }
                
                if (response.data.data !== undefined) {
                    console.log('  - Has data field:', typeof response.data.data);
                    console.log('  - Data is array:', Array.isArray(response.data.data));
                    if (Array.isArray(response.data.data)) {
                        console.log('  - Data array length:', response.data.data.length);
                        if (response.data.data.length > 0) {
                            console.log('  - First item sample:', response.data.data[0]);
                        }
                    } else if (response.data.data && typeof response.data.data === 'object') {
                        console.log('  - Data object keys:', Object.keys(response.data.data));
                        
                        if (response.data.data.requests) {
                            console.log('  - Has requests field:', Array.isArray(response.data.data.requests));
                            console.log('  - Requests length:', response.data.data.requests?.length || 0);
                        }
                        
                        if (response.data.data.pagination) {
                            console.log('  - Has pagination field:', response.data.data.pagination);
                        }
                    }
                }
                
                if (response.data.pagination !== undefined) {
                    console.log('  - Has pagination field:', response.data.pagination);
                }
                
                if (response.data.meta !== undefined) {
                    console.log('  - Has meta field:', response.data.meta);
                }
                
                if (Array.isArray(response.data)) {
                    console.log('  - Response.data is direct array with length:', response.data.length);
                }
            }
            
            return response.data;
        } catch (error) {
            console.error('❌ suratPengantarService.getMyRequests error:', error);
            console.error('❌ Error type:', error.constructor.name);
            console.error('❌ Error message:', error.message);
            
            if (error.response) {
                console.error('❌ Response status:', error.response.status);
                console.error('❌ Response data:', error.response.data);
                console.error('❌ Response headers:', error.response.headers);
            } else if (error.request) {
                console.error('❌ Request was made but no response:', error.request);
            } else {
                console.error('❌ Error setting up request:', error.message);
            }
            
            // Handle specific validation errors from backend
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message || 'Invalid request parameters';
                console.error('❌ 400 Bad Request:', errorMessage);
                throw new Error(errorMessage);
            }
            
            if (error.response?.status === 401) {
                console.error('❌ 401 Unauthorized - user not logged in');
                throw new Error('Silakan login terlebih dahulu');
            }
            
            if (error.response?.status === 403) {
                console.error('❌ 403 Forbidden - insufficient permissions');
                throw new Error('Anda tidak memiliki akses untuk melihat data ini');
            }
            
            if (error.response?.status === 404) {
                console.error('❌ 404 Not Found - endpoint not found');
                throw new Error('Endpoint tidak ditemukan');
            }
            
            if (error.response?.status >= 500) {
                console.error('❌ 5xx Server Error');
                throw new Error('Terjadi kesalahan server. Silakan coba lagi nanti.');
            }
            
            throw error;
        }
    },

    // Get surat pengantar detail
    getDetail: async (id) => {
        console.log('🔧 suratPengantarService.getDetail called with id:', id);
        
        if (!id || typeof id !== 'string') {
            const error = new Error('Invalid ID parameter');
            console.error('❌ Invalid ID:', error.message);
            throw error;
        }
        
        try {
            console.log('🔧 Making API call to /api/surat-pengantar/' + id);
            const response = await api.get(`/api/surat-pengantar/${id}`);
            console.log('✅ GetDetail response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ suratPengantarService.getDetail error:', error);
            
            if (error.response?.status === 404) {
                throw new Error('Surat pengantar tidak ditemukan');
            }
            
            throw error;
        }
    },

    // Download PDF
    downloadPDF: async (id) => {
        console.log('🔧 suratPengantarService.downloadPDF called with id:', id);
        
        if (!id || typeof id !== 'string') {
            throw new Error('Invalid ID parameter');
        }
        
        try {
            const response = await api.get(`/api/surat-pengantar/${id}/download`, {
                responseType: 'blob'
            });
            console.log('✅ DownloadPDF response received');
            return response;
        } catch (error) {
            console.error('❌ suratPengantarService.downloadPDF error:', error);
            
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
        console.log('🔧 suratPengantarService.getPendingForRT called with:', params);
        
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
            console.log('✅ GetPendingForRT response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ suratPengantarService.getPendingForRT error:', error);
            throw error;
        }
    },

    rtApproval: async (id, data) => {
        console.log('🔧 suratPengantarService.rtApproval called with:', { id, data });
        
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
            console.log('✅ RTApproval response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ suratPengantarService.rtApproval error:', error);
            throw error;
        }
    },

    getRTStatistics: async (params = {}) => {
        console.log('🔧 suratPengantarService.getRTStatistics called with:', params);
        
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
            console.log('✅ GetRTStatistics response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ suratPengantarService.getRTStatistics error:', error);
            throw error;
        }
    },

    // RW Management
    getPendingForRW: async (params = {}) => {
        console.log('🔧 suratPengantarService.getPendingForRW called with:', params);
        
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
            console.log('✅ GetPendingForRW response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ suratPengantarService.getPendingForRW error:', error);
            throw error;
        }
    },

    rwApproval: async (id, data) => {
        console.log('🔧 suratPengantarService.rwApproval called with:', { id, data });
        
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
            console.log('✅ RWApproval response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ suratPengantarService.rwApproval error:', error);
            throw error;
        }
    },

    getRWStatistics: async (params = {}) => {
        console.log('🔧 suratPengantarService.getRWStatistics called with:', params);
        
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
            console.log('✅ GetRWStatistics response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ suratPengantarService.getRWStatistics error:', error);
            throw error;
        }
    },

    // Admin Management
    getAdminStatistics: async (params = {}) => {
        console.log('🔧 suratPengantarService.getAdminStatistics called with:', params);
        
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
            console.log('✅ GetAdminStatistics response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ suratPengantarService.getAdminStatistics error:', error);
            throw error;
        }
    },

    // QR Code verification (public)
    verifyQRCode: async (token) => {
        console.log('🔧 suratPengantarService.verifyQRCode called with token:', token);
        
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
            console.log('✅ VerifyQRCode response:', data);
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to verify QR code');
            }
            
            return data;
        } catch (error) {
            console.error('❌ suratPengantarService.verifyQRCode error:', error);
            throw error;
        }
    }
};

export default suratPengantarService;