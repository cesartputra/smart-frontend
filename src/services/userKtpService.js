// src/services/userKtpService.js
import api from './api';

const userKtpService = {
    /**
     * Get current user's KTP data
     * Endpoint: GET /api/user-ktp
     * Requires: Verified User (Auth + Email + Active)
     */
    getKTP: async () => {
        console.log('UserKtpService.getKTP called');
        try {
            const response = await api.get('/api/user-ktp');
            console.log('GetKTP response:', response.data);
            return response.data;
        } catch (error) {
            console.error('UserKtpService.getKTP error:', error);
            throw error;
        }
    },

    /**
     * Create/Claim KTP data
     * Endpoint: POST /api/user-ktp
     * Requires: Verified User
     * Supports both new registration and claiming existing data
     */
    createKTP: async (ktpData) => {
        console.log('UserKtpService.createKTP called with:', ktpData);
        
        if (!ktpData || !ktpData.nik) {
            throw new Error('NIK wajib diisi');
        }
        
        try {
            const response = await api.post('/api/user-ktp', ktpData);
            console.log('CreateKTP response:', response.data);
            return response.data;
        } catch (error) {
            console.error('UserKtpService.createKTP error:', error);
            
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message;
                if (errorMessage?.includes('NIK already registered')) {
                    throw new Error('NIK sudah terdaftar oleh pengguna lain');
                }
                if (errorMessage?.includes('invalid format')) {
                    throw new Error('Format NIK tidak valid');
                }
                throw new Error(errorMessage || 'Data KTP tidak valid');
            }
            
            throw error;
        }
    },

    /**
     * Update KTP data
     * Endpoint: PATCH /api/user-ktp
     * Requires: Complete User (Auth + Email + Active + KTP)
     */
    updateKTP: async (updateData) => {
        console.log('UserKtpService.updateKTP called with:', updateData);
        
        if (!updateData) {
            throw new Error('Data update wajib diisi');
        }
        
        try {
            const response = await api.patch('/api/user-ktp', updateData);
            console.log('UpdateKTP response:', response.data);
            return response.data;
        } catch (error) {
            console.error('UserKtpService.updateKTP error:', error);
            
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message;
                throw new Error(errorMessage || 'Data yang dimasukkan tidak valid');
            }
            
            throw error;
        }
    },

    /**
     * Register new family member
     * Endpoint: POST /api/user-ktp/family-member
     * Requires: Complete User
     * All fields required (strict validation)
     */
    registerFamilyMember: async (memberData) => {
        console.log('UserKtpService.registerFamilyMember called with:', memberData);
        
        if (!memberData) {
            throw new Error('Data anggota keluarga wajib diisi');
        }
        
        try {
            const response = await api.post('/api/user-ktp/family-member', memberData);
            console.log('RegisterFamilyMember response:', response.data);
            return response.data;
        } catch (error) {
            console.error('UserKtpService.registerFamilyMember error:', error);
            
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message;
                if (errorMessage?.includes('NIK already exists')) {
                    throw new Error('NIK sudah terdaftar dalam sistem');
                }
                if (errorMessage?.includes('invalid data')) {
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
     * Update family member data
     * Endpoint: PUT /api/user-ktp/family-member/:ktpId (assuming this exists)
     * Requires: Complete User
     */
    updateFamilyMember: async (ktpId, updateData) => {
        console.log('UserKtpService.updateFamilyMember called with:', { ktpId, updateData });
        
        if (!ktpId || !updateData) {
            throw new Error('ID dan data anggota keluarga wajib diisi');
        }
        
        try {
            const response = await api.patch(`/api/user-ktp/family-member/${ktpId}`, updateData);
            console.log('UpdateFamilyMember response:', response.data);
            return response.data;
        } catch (error) {
            console.error('UserKtpService.updateFamilyMember error:', error);
            
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message;
                throw new Error(errorMessage || 'Data yang dimasukkan tidak valid');
            }
            
            if (error.response?.status === 403) {
                throw new Error('Anda tidak memiliki izin untuk mengubah data anggota ini');
            }
            
            if (error.response?.status === 404) {
                throw new Error('Anggota keluarga tidak ditemukan');
            }
            
            throw error;
        }
    },

    /**
     * Delete family member
     * Endpoint: DELETE /api/user-ktp/family-member/:ktpId
     * Requires: Complete User
     */
    deleteFamilyMember: async (ktpId) => {
        console.log('UserKtpService.deleteFamilyMember called with ktpId:', ktpId);
        
        if (!ktpId) {
            throw new Error('ID anggota keluarga wajib diisi');
        }
        
        try {
            const response = await api.delete(`/api/user-ktp/family-member/${ktpId}`);
            console.log('DeleteFamilyMember response:', response.data);
            return response.data;
        } catch (error) {
            console.error('UserKtpService.deleteFamilyMember error:', error);
            
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message;
                if (errorMessage?.includes('cannot delete')) {
                    throw new Error('Anggota ini tidak dapat dihapus');
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
     * Check delete permission for family member
     * Endpoint: GET /api/user-ktp/family-member/:ktpId/delete-permission
     * Requires: Complete User
     */
    checkDeletePermission: async (ktpId) => {
        console.log('UserKtpService.checkDeletePermission called with ktpId:', ktpId);
        
        if (!ktpId) {
            throw new Error('ID anggota keluarga wajib diisi');
        }
        
        try {
            const response = await api.get(`/api/user-ktp/family-member/${ktpId}/delete-permission`);
            console.log('CheckDeletePermission response:', response.data);
            return response.data;
        } catch (error) {
            console.error('UserKtpService.checkDeletePermission error:', error);
            throw error;
        }
    },

    /**
     * Get unclaimed family members
     * Endpoint: GET /api/user-ktp/unclaimed-members
     * Requires: Complete User
     */
    getUnclaimedFamilyMembers: async () => {
        console.log('UserKtpService.getUnclaimedFamilyMembers called');
        try {
            const response = await api.get('/api/user-ktp/unclaimed-members');
            console.log('GetUnclaimedFamilyMembers response:', response.data);
            return response.data;
        } catch (error) {
            console.error('UserKtpService.getUnclaimedFamilyMembers error:', error);
            throw error;
        }
    },

    /**
     * Get registered family members
     * Endpoint: GET /api/user-ktp/registered-members
     * Requires: Complete User
     */
    getRegisteredFamilyMembers: async () => {
        console.log('UserKtpService.getRegisteredFamilyMembers called');
        try {
            const response = await api.get('/api/user-ktp/registered-members');
            console.log('GetRegisteredFamilyMembers response:', response.data);
            return response.data;
        } catch (error) {
            console.error('UserKtpService.getRegisteredFamilyMembers error:', error);
            throw error;
        }
    },

    /**
     * Check if NIK can be claimed
     * Endpoint: GET /api/user-ktp/check-claim/:nik
     * Requires: Verified User
     */
    checkNikClaimability: async (nik) => {
        console.log('UserKtpService.checkNikClaimability called with nik:', nik);
        
        if (!nik) {
            throw new Error('NIK wajib diisi');
        }
        
        // Validate NIK format
        if (!/^\d{16}$/.test(nik)) {
            throw new Error('NIK harus 16 digit angka');
        }
        
        try {
            const response = await api.get(`/api/user-ktp/check-claim/${nik.trim()}`);
            console.log('CheckNikClaimability response:', response.data);
            return response.data;
        } catch (error) {
            console.error('UserKtpService.checkNikClaimability error:', error);
            
            if (error.response?.status === 400) {
                throw new Error('Format NIK tidak valid');
            }
            
            throw error;
        }
    }
};

export default userKtpService;