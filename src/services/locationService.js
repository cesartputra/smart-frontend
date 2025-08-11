// src/services/locationService.js - FIXED VERSION
import api from './api';

const locationService = {
    // Get provinces - FIXED response handling
    getProvinces: async () => {
        try {
            console.log('🌍 Fetching provinces...');
            const response = await api.get('/api/locations/provinces');
            console.log('✅ Provinces response:', response.data);
            
            // Handle both possible response structures
            if (response.data.success && response.data.data) {
                // New structure: { success: true, data: { provinces: [...] } }
                return response.data.data.provinces || response.data.data;
            } else if (response.data.provinces) {
                // Alternative structure: { provinces: [...] }
                return response.data.provinces;
            } else if (Array.isArray(response.data)) {
                // Direct array: [...]
                return response.data;
            }
            
            console.warn('⚠️ Unexpected provinces response structure:', response.data);
            return [];
        } catch (error) {
            console.error('❌ Provinces fetch error:', error);
            throw error;
        }
    },

    // Get cities by province - FIXED response handling
    getCities: async (provinceId) => {
        try {
            console.log(`🏙️ Fetching cities for province ${provinceId}...`);
            const response = await api.get(`/api/locations/provinces/${provinceId}/cities`);
            console.log('✅ Cities response:', response.data);
            
            // Handle both possible response structures
            if (response.data.success && response.data.data) {
                return response.data.data.cities || response.data.data;
            } else if (response.data.cities) {
                return response.data.cities;
            } else if (Array.isArray(response.data)) {
                return response.data;
            }
            
            console.warn('⚠️ Unexpected cities response structure:', response.data);
            return [];
        } catch (error) {
            console.error('❌ Cities fetch error:', error);
            throw error;
        }
    },

    // Get kecamatan by city - FIXED response handling
    getKecamatan: async (cityId) => {
        try {
            console.log(`🏘️ Fetching kecamatan for city ${cityId}...`);
            const response = await api.get(`/api/locations/cities/${cityId}/kecamatan`);
            console.log('✅ Kecamatan response:', response.data);
            
            if (response.data.success && response.data.data) {
                return response.data.data.kecamatan || response.data.data;
            } else if (response.data.kecamatan) {
                return response.data.kecamatan;
            } else if (Array.isArray(response.data)) {
                return response.data;
            }
            
            console.warn('⚠️ Unexpected kecamatan response structure:', response.data);
            return [];
        } catch (error) {
            console.error('❌ Kecamatan fetch error:', error);
            throw error;
        }
    },

    // Get kelurahan by kecamatan - FIXED response handling
    getKelurahan: async (kecamatanId) => {
        try {
            console.log(`🏡 Fetching kelurahan for kecamatan ${kecamatanId}...`);
            const response = await api.get(`/api/locations/kecamatan/${kecamatanId}/kelurahan`);
            console.log('✅ Kelurahan response:', response.data);
            
            if (response.data.success && response.data.data) {
                return response.data.data.kelurahan || response.data.data;
            } else if (response.data.kelurahan) {
                return response.data.kelurahan;
            } else if (Array.isArray(response.data)) {
                return response.data;
            }
            
            console.warn('⚠️ Unexpected kelurahan response structure:', response.data);
            return [];
        } catch (error) {
            console.error('❌ Kelurahan fetch error:', error);
            throw error;
        }
    },

    // Get RW by kelurahan - FIXED response handling
    getRW: async (kelurahanId) => {
        try {
            console.log(`🏘️ Fetching RW for kelurahan ${kelurahanId}...`);
            const response = await api.get(`/api/locations/kelurahan/${kelurahanId}/rw`);
            console.log('✅ RW response:', response.data);
            
            if (response.data.success && response.data.data) {
                return response.data.data.rw || response.data.data;
            } else if (response.data.rw) {
                return response.data.rw;
            } else if (Array.isArray(response.data)) {
                return response.data;
            }
            
            console.warn('⚠️ Unexpected RW response structure:', response.data);
            return [];
        } catch (error) {
            console.error('❌ RW fetch error:', error);
            throw error;
        }
    },

    // Get RT by RW - FIXED response handling
    getRT: async (rwId) => {
        try {
            console.log(`🏠 Fetching RT for RW ${rwId}...`);
            const response = await api.get(`/api/locations/rw/${rwId}/rt`);
            console.log('✅ RT response:', response.data);
            
            if (response.data.success && response.data.data) {
                return response.data.data.rt || response.data.data;
            } else if (response.data.rt) {
                return response.data.rt;
            } else if (Array.isArray(response.data)) {
                return response.data;
            }
            
            console.warn('⚠️ Unexpected RT response structure:', response.data);
            return [];
        } catch (error) {
            console.error('❌ RT fetch error:', error);
            throw error;
        }
    }
};

export default locationService;