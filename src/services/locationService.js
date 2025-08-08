// src/services/locationService.js
import api from './api';

const locationService = {
    // Get provinces
    getProvinces: async () => {
        try {
        const response = await api.get('/api/locations/provinces');
        return response.data;
        } catch (error) {
        console.error('LocationService.getProvinces error:', error);
        throw error;
        }
    },

    // Get cities by province
    getCities: async (provinceId) => {
        try {
        const response = await api.get(`/api/locations/provinces/${provinceId}/cities`);
        return response.data;
        } catch (error) {
        console.error('LocationService.getCities error:', error);
        throw error;
        }
    },

    // Get kecamatan by city
    getKecamatan: async (cityId) => {
        try {
        const response = await api.get(`/api/locations/cities/${cityId}/kecamatan`);
        return response.data;
        } catch (error) {
        console.error('LocationService.getKecamatan error:', error);
        throw error;
        }
    },

    // Get kelurahan by kecamatan
    getKelurahan: async (kecamatanId) => {
        try {
        const response = await api.get(`/api/locations/kecamatan/${kecamatanId}/kelurahan`);
        return response.data;
        } catch (error) {
        console.error('LocationService.getKelurahan error:', error);
        throw error;
        }
    },

    // Get RW by kelurahan
    getRW: async (kelurahanId) => {
        try {
        const response = await api.get(`/api/locations/kelurahan/${kelurahanId}/rw`);
        return response.data;
        } catch (error) {
        console.error('LocationService.getRW error:', error);
        throw error;
        }
    },

    // Get RT by RW
    getRT: async (rwId) => {
        try {
        const response = await api.get(`/api/locations/rw/${rwId}/rt`);
        return response.data;
        } catch (error) {
        console.error('LocationService.getRT error:', error);
        throw error;
        }
    }
};

export default locationService;