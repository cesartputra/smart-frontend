// src/services/KartuKeluargaService.js
import api from './api';

const kartuKeluargaService = {
    /**
     * Get my family members
     * Endpoint: GET /api/kartu-keluarga/my-family
     * Requires: Full Profile (Auth + Email + KTP + User Details)
     */
    getMyFamily: async () => {
        console.log('KartuKeluargaService.getMyFamily called');
        try {
            const response = await api.get('/api/kartu-keluarga/my-family');
            console.log('GetMyFamily response:', response.data);
            return response.data;
        } catch (error) {
            console.error('KartuKeluargaService.getMyFamily error:', error);
            
            // Handle specific error cases
            if (error.response?.status === 403) {
                const errorData = error.response.data;
                if (errorData.requiresKTPCompletion) {
                    throw new Error('Please complete your KTP data first');
                }
                if (errorData.requiresUserDetailsCompletion) {
                    throw new Error('Please complete your user details first');
                }
                if (errorData.requiresEmailVerification) {
                    throw new Error('Please verify your email first');
                }
            }
            
            throw error;
        }
    },

    /**
     * Get KK details by ID
     * Endpoint: GET /api/kartu-keluarga/:kkId
     * Requires: Full Profile
     */
    getDetails: async (kkId) => {
        console.log('KartuKeluargaService.getDetails called with kkId:', kkId);
        
        if (!kkId) {
            throw new Error('KK ID is required');
        }
        
        try {
            const response = await api.get(`/api/kartu-keluarga/${kkId}`);
            console.log('GetDetails response:', response.data);
            return response.data;
        } catch (error) {
            console.error('KartuKeluargaService.getDetails error:', error);
            
            if (error.response?.status === 404) {
                throw new Error('Kartu Keluarga tidak ditemukan');
            }
            
            throw error;
        }
    },

    /**
     * Validate KK for joining
     * Endpoint: POST /api/kartu-keluarga/validate
     * Requires: Verified User (Auth + Email + Active)
     */
    validateKK: async (kkNo, rtId) => {
        console.log('KartuKeluargaService.validateKK called with:', { kkNo, rtId });
        
        // Client-side validation
        if (!kkNo || !rtId) {
            throw new Error('Nomor KK dan RT ID wajib diisi');
        }
        
        // Validate KK number format (16 digits)
        if (!/^\d{16}$/.test(kkNo)) {
            throw new Error('Nomor Kartu Keluarga harus 16 digit angka');
        }
        
        // Validate RT ID
        const rtIdNum = parseInt(rtId);
        if (isNaN(rtIdNum) || rtIdNum <= 0) {
            throw new Error('RT ID harus berupa angka positif');
        }
        
        try {
            const response = await api.post('/api/kartu-keluarga/validate', {
                kkNo: kkNo.trim(),
                rtId: rtIdNum
            });
            console.log('ValidateKK response:', response.data);
            return response.data;
        } catch (error) {
            console.error('KartuKeluargaService.validateKK error:', error);
            
            // Handle specific validation errors
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message;
                if (errorMessage?.includes('16 digits')) {
                    throw new Error('Nomor Kartu Keluarga harus 16 digit');
                }
                if (errorMessage?.includes('different RT')) {
                    throw new Error('Kartu Keluarga terdaftar di RT yang berbeda');
                }
                if (errorMessage?.includes('not active')) {
                    throw new Error('Kartu Keluarga tidak aktif');
                }
                if (errorMessage?.includes('not found')) {
                    throw new Error('Kartu Keluarga tidak ditemukan');
                }
                
                throw new Error(errorMessage || 'Data KK tidak valid');
            }
            
            throw error;
        }
    },

    /**
     * Check KK availability
     * Endpoint: GET /api/kartu-keluarga/check/:kkNo
     * Requires: Verified User
     */
    checkAvailability: async (kkNo) => {
        console.log('KartuKeluargaService.checkAvailability called with kkNo:', kkNo);
        
        if (!kkNo) {
            throw new Error('Nomor KK wajib diisi');
        }
        
        // Validate KK number format
        if (!/^\d{16}$/.test(kkNo)) {
            throw new Error('Nomor Kartu Keluarga harus 16 digit angka');
        }
        
        try {
            const response = await api.get(`/api/kartu-keluarga/check/${kkNo.trim()}`);
            console.log('CheckAvailability response:', response.data);
            return response.data;
        } catch (error) {
            console.error('KartuKeluargaService.checkAvailability error:', error);
            
            if (error.response?.status === 400) {
                throw new Error('Format nomor KK tidak valid');
            }
            
            throw error;
        }
    },

    /**
     * Get KK statistics for RT
     * Endpoint: GET /api/kartu-keluarga/statistics/:rtId
     * Requires: Full Profile
     */
    getStatistics: async (rtId) => {
        console.log('KartuKeluargaService.getStatistics called with rtId:', rtId);
        
        if (!rtId) {
            throw new Error('RT ID is required');
        }
        
        const rtIdNum = parseInt(rtId);
        if (isNaN(rtIdNum) || rtIdNum <= 0) {
            throw new Error('RT ID harus berupa angka positif');
        }
        
        try {
            const response = await api.get(`/api/kartu-keluarga/statistics/${rtIdNum}`);
            console.log('GetStatistics response:', response.data);
            return response.data;
        } catch (error) {
            console.error('KartuKeluargaService.getStatistics error:', error);
            
            if (error.response?.status === 403) {
                throw new Error('Anda tidak memiliki akses untuk melihat statistik ini');
            }
            
            throw error;
        }
    },

    /**
     * Helper function to format KK number for display
     */
    formatKKNumber: (kkNo) => {
        if (!kkNo || typeof kkNo !== 'string') return kkNo;
        
        // Format: XXXX.XXXX.XXXX.XXXX
        return kkNo.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1.$2.$3.$4');
    },

    /**
     * Helper function to validate KK number format
     */
    validateKKFormat: (kkNo) => {
        if (!kkNo) {
            return { valid: false, message: 'Nomor KK wajib diisi' };
        }
        
        // Remove any non-digit characters
        const cleanKK = kkNo.replace(/\D/g, '');
        
        if (cleanKK.length !== 16) {
            return { valid: false, message: 'Nomor KK harus 16 digit' };
        }
        
        // Basic validation - check if all digits are the same (unlikely valid KK)
        if (/^(\d)\1{15}$/.test(cleanKK)) {
            return { valid: false, message: 'Nomor KK tidak valid' };
        }
        
        return { valid: true, cleanKK };
    },

    /**
     * Helper function to get relationship status in Indonesian
     */
    getRelationshipText: (relationship) => {
        const relationships = {
            'KEPALA_KELUARGA': 'Kepala Keluarga',
            'ISTRI': 'Istri',
            'ANAK': 'Anak',
            'MENANTU': 'Menantu',
            'CUCU': 'Cucu',
            'ORANG_TUA': 'Orang Tua',
            'MERTUA': 'Mertua',
            'FAMILI_LAIN': 'Famili Lain',
            'PEMBANTU': 'Pembantu',
            'LAINNYA': 'Lainnya'
        };
        
        return relationships[relationship] || relationship;
    },

    /**
     * Helper function to get registration status text
     */
    getRegistrationStatusText: (status) => {
        const statuses = {
            'CLAIMED': 'Terdaftar',
            'UNCLAIMED': 'Belum Terdaftar'
        };
        
        return statuses[status] || status;
    },

    /**
     * Helper function to get registration status badge color
     */
    getRegistrationStatusColor: (status) => {
        const colors = {
            'CLAIMED': 'bg-green-100 text-green-800',
            'UNCLAIMED': 'bg-yellow-100 text-yellow-800'
        };
        
        return colors[status] || 'bg-gray-100 text-gray-800';
    },

    /**
     * Helper function to format member data for display
     */
    formatMemberData: (member) => {
        if (!member) return null;
        
        return {
            ...member,
            formatted_nik: member.nik?.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-****-****-$4'),
            relationship_text: kartuKeluargaService.getRelationshipText(member.hubungan_keluarga),
            registration_status_text: kartuKeluargaService.getRegistrationStatusText(member.registration_status),
            registration_status_color: kartuKeluargaService.getRegistrationStatusColor(member.registration_status),
            age: member.dob ? kartuKeluargaService.calculateAge(member.dob) : null,
            formatted_dob: member.dob ? new Date(member.dob).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }) : null
        };
    },

    /**
     * Helper function to calculate age from date of birth
     */
    calculateAge: (dob) => {
        if (!dob) return null;
        
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    },

    /**
     * Helper function to sort family members by hierarchy
     */
    sortMembersByHierarchy: (members) => {
        if (!Array.isArray(members)) return [];
        
        const hierarchy = {
            'KEPALA_KELUARGA': 1,
            'ISTRI': 2,
            'ANAK': 3,
            'MENANTU': 4,
            'CUCU': 5,
            'ORANG_TUA': 6,
            'MERTUA': 7,
            'FAMILI_LAIN': 8,
            'PEMBANTU': 9,
            'LAINNYA': 10
        };
        
        return members.sort((a, b) => {
            // First sort by relationship hierarchy
            const aHierarchy = hierarchy[a.hubungan_keluarga] || 10;
            const bHierarchy = hierarchy[b.hubungan_keluarga] || 10;
            
            if (aHierarchy !== bHierarchy) {
                return aHierarchy - bHierarchy;
            }
            
            // Then sort by age (older first)
            const aAge = kartuKeluargaService.calculateAge(a.dob) || 0;
            const bAge = kartuKeluargaService.calculateAge(b.dob) || 0;
            
            return bAge - aAge;
        });
    }
};

export default kartuKeluargaService;