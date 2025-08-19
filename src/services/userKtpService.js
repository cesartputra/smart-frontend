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
    },

    // Tambahkan fungsi-fungsi ini di kartuKeluargaService object

    /**
     * Add new family member
     * Endpoint: POST /api/user-ktp/family-member
     * Requires: Complete User (Auth + Email + KTP)
     */
    addFamilyMember: async (memberData) => {
        console.log('KartuKeluargaService.addFamilyMember called with:', memberData);
        
        if (!memberData) {
            throw new Error('Data anggota keluarga wajib diisi');
        }
        
        try {
            const response = await api.post('/api/user-ktp/family-member', memberData);
            console.log('AddFamilyMember response:', response.data);
            return response.data;
        } catch (error) {
            console.error('KartuKeluargaService.addFamilyMember error:', error);
            
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message;
                if (errorMessage?.includes('NIK already exists')) {
                    throw new Error('NIK sudah terdaftar dalam sistem');
                }
                if (errorMessage?.includes('invalid')) {
                    throw new Error('Data yang dimasukkan tidak valid');
                }
                throw new Error(errorMessage || 'Data tidak valid');
            }
            
            if (error.response?.status === 403) {
                throw new Error('Anda tidak memiliki izin untuk menambah anggota');
            }
            
            throw error;
        }
    },

    /**
     * Update family member - NOT AVAILABLE in backend routes
     * Consider using separate update endpoint or modify backend
     */
    updateFamilyMember: async (ktpId, updateData) => {
        console.log('KartuKeluargaService.updateFamilyMember called with:', { ktpId, updateData });
        
        // Backend doesn't have update endpoint for family members
        // You might need to add this endpoint in backend or handle differently
        throw new Error('Update family member functionality not implemented in backend');
    },

    /**
     * Delete family member
     * Endpoint: DELETE /api/user-ktp/family-member/:ktpId
     * Requires: Complete User (Auth + Email + KTP)
     */
    deleteFamilyMember: async (ktpId) => {
        console.log('KartuKeluargaService.deleteFamilyMember called with ktpId:', ktpId);
        
        if (!ktpId) {
            throw new Error('ID anggota keluarga wajib diisi');
        }
        
        try {
            const response = await api.delete(`/api/user-ktp/family-member/${ktpId}`);
            console.log('DeleteFamilyMember response:', response.data);
            return response.data;
        } catch (error) {
            console.error('KartuKeluargaService.deleteFamilyMember error:', error);
            
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message;
                if (errorMessage?.includes('cannot delete head')) {
                    throw new Error('Kepala keluarga tidak dapat dihapus');
                }
                if (errorMessage?.includes('has user account')) {
                    throw new Error('Anggota yang sudah memiliki akun tidak dapat dihapus');
                }
                throw new Error(errorMessage || 'Tidak dapat menghapus anggota keluarga');
            }
            
            if (error.response?.status === 403) {
                throw new Error('Anda tidak memiliki izin untuk menghapus anggota ini');
            }
            
            if (error.response?.status === 404) {
                throw new Error('Anggota keluarga tidak ditemukan');
            }
            
            throw error;
        }
    },

    /**
     * Get unclaimed family members
     * Endpoint: GET /api/user-ktp/unclaimed-members
     * Requires: Complete User
     */
    getUnclaimedFamilyMembers: async () => {
        console.log('KartuKeluargaService.getUnclaimedFamilyMembers called');
        
        try {
            const response = await api.get('/api/user-ktp/unclaimed-members');
            console.log('GetUnclaimedFamilyMembers response:', response.data);
            return response.data;
        } catch (error) {
            console.error('KartuKeluargaService.getUnclaimedFamilyMembers error:', error);
            throw error;
        }
    },

    /**
     * Get registered family members
     * Endpoint: GET /api/user-ktp/registered-members
     * Requires: Complete User
     */
    getRegisteredFamilyMembers: async () => {
        console.log('KartuKeluargaService.getRegisteredFamilyMembers called');
        
        try {
            const response = await api.get('/api/user-ktp/registered-members');
            console.log('GetRegisteredFamilyMembers response:', response.data);
            return response.data;
        } catch (error) {
            console.error('KartuKeluargaService.getRegisteredFamilyMembers error:', error);
            throw error;
        }
    },

    /**
     * Check if NIK can be claimed
     * Endpoint: GET /api/user-ktp/check-claim/:nik
     * Requires: Verified User
     */
    checkNikClaimability: async (nik) => {
        console.log('KartuKeluargaService.checkNikClaimability called with nik:', nik);
        
        if (!nik) {
            throw new Error('NIK wajib diisi');
        }
        
        try {
            const response = await api.get(`/api/user-ktp/check-claim/${nik}`);
            console.log('CheckNikClaimability response:', response.data);
            return response.data;
        } catch (error) {
            console.error('KartuKeluargaService.checkNikClaimability error:', error);
            throw error;
        }
    },

    /**
     * Check delete permission
     * Endpoint: GET /api/user-ktp/family-member/:ktpId/delete-permission
     * Requires: Complete User
     */
    checkDeletePermission: async (ktpId) => {
        console.log('KartuKeluargaService.checkDeletePermission called with ktpId:', ktpId);
        
        if (!ktpId) {
            throw new Error('KTP ID wajib diisi');
        }
        
        try {
            const response = await api.get(`/api/user-ktp/family-member/${ktpId}/delete-permission`);
            console.log('CheckDeletePermission response:', response.data);
            return response.data;
        } catch (error) {
            console.error('KartuKeluargaService.checkDeletePermission error:', error);
            throw error;
        }
    },
};

export default ktpService;