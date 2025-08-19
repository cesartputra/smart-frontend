// src/hooks/useKartuKeluarga.js - FIXED TO MATCH BACKEND ENDPOINTS
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import kartuKeluargaService from '../services/kartuKeluargaService';
import userKtpService from '../services/userKtpService';

// Query keys untuk konsistensi dan invalidation
export const KARTU_KELUARGA_QUERY_KEYS = {
    MY_FAMILY: 'my-family',
    KK_DETAILS: 'kk-details',
    KK_STATISTICS: 'kk-statistics',
    KK_AVAILABILITY: 'kk-availability'
};

export const useKartuKeluarga = () => {
    const queryClient = useQueryClient();
    
    // ===== MY FAMILY =====
    const myFamilyQuery = useQuery({
        queryKey: [KARTU_KELUARGA_QUERY_KEYS.MY_FAMILY],
        queryFn: kartuKeluargaService.getMyFamily,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes (was cacheTime)
        retry: 2,
        onError: (error) => {
            console.error('Failed to fetch family data:', error);
            
            // Handle specific errors sesuai dengan backend controller
            if (error.response?.status === 404) {
                toast.error('Data KTP tidak ditemukan');
            } else if (error.response?.status === 403) {
                const errorData = error.response.data;
                if (errorData.requiresKTPCompletion) {
                    toast.error('Silakan lengkapi data KTP Anda terlebih dahulu');
                } else if (errorData.requiresUserDetailsCompletion) {
                    toast.error('Silakan lengkapi data diri Anda terlebih dahulu');
                } else if (errorData.requiresEmailVerification) {
                    toast.error('Silakan verifikasi email Anda terlebih dahulu');
                } else {
                    toast.error('Anda tidak memiliki akses untuk melihat data ini');
                }
            } else if (error.response?.status === 500) {
                toast.error('Terjadi kesalahan server');
            } else {
                toast.error('Gagal memuat data keluarga');
            }
        }
    });

    // Memoized family data dengan formatting sesuai struktur backend
    const familyData = useMemo(() => {
        if (!myFamilyQuery.data?.data) return null;
        
        const data = myFamilyQuery.data.data;
        const members = data.family_members || [];
        
        // Format members dengan helper functions dari service
        const formattedMembers = members.map(member => 
            kartuKeluargaService.formatMemberData(member)
        );
        
        // Sort members by hierarchy
        const sortedMembers = kartuKeluargaService.sortMembersByHierarchy(formattedMembers);
        
        return {
            ...data,
            members: sortedMembers,
            formatted_kk_no: kartuKeluargaService.formatKKNumber(data.no),
            claimed_members: formattedMembers.filter(m => m.registration_status === 'CLAIMED'),
            unclaimed_members: formattedMembers.filter(m => m.registration_status === 'UNCLAIMED')
        };
    }, [myFamilyQuery.data]);

    // ===== KK DETAILS QUERY =====
    const useKKDetails = (kkId) => {
        return useQuery({
            queryKey: [KARTU_KELUARGA_QUERY_KEYS.KK_DETAILS, kkId],
            queryFn: () => kartuKeluargaService.getDetails(kkId),
            enabled: !!kkId,
            staleTime: 2 * 60 * 1000, // 2 minutes
            onError: (error) => {
                console.error('Failed to fetch KK details:', error);
                
                if (error.response?.status === 404) {
                    toast.error('Kartu Keluarga tidak ditemukan');
                } else if (error.response?.status === 403) {
                    toast.error('Anda tidak memiliki akses untuk melihat data ini');
                } else {
                    toast.error('Gagal memuat detail Kartu Keluarga');
                }
            }
        });
    };

    // ===== KK STATISTICS QUERY =====
    const useKKStatistics = (rtId) => {
        return useQuery({
            queryKey: [KARTU_KELUARGA_QUERY_KEYS.KK_STATISTICS, rtId],
            queryFn: () => kartuKeluargaService.getStatistics(rtId),
            enabled: !!rtId,
            staleTime: 5 * 60 * 1000, // 5 minutes
            onError: (error) => {
                console.error('Failed to fetch KK statistics:', error);
                
                if (error.response?.status === 403) {
                    toast.error('Anda tidak memiliki akses untuk melihat statistik ini');
                } else if (error.response?.status === 400) {
                    toast.error('RT ID tidak valid');
                } else {
                    toast.error('Gagal memuat statistik Kartu Keluarga');
                }
            }
        });
    };

    // ===== KK AVAILABILITY QUERY =====
    const useKKAvailability = (kkNo) => {
        return useQuery({
            queryKey: [KARTU_KELUARGA_QUERY_KEYS.KK_AVAILABILITY, kkNo],
            queryFn: () => kartuKeluargaService.checkAvailability(kkNo),
            enabled: !!kkNo && kartuKeluargaService.validateKKFormat(kkNo).valid,
            staleTime: 1 * 60 * 1000, // 1 minute
            retry: 1,
            onError: (error) => {
                console.error('Failed to check KK availability:', error);
                
                if (error.response?.status === 400) {
                    toast.error('Format nomor Kartu Keluarga tidak valid');
                } else {
                    toast.error('Gagal memeriksa ketersediaan KK');
                }
            }
        });
    };

    // ===== MUTATIONS =====
    
    // Validate KK Mutation
    const validateKKMutation = useMutation({
        mutationFn: ({ kkNo, rtId }) => kartuKeluargaService.validateKK(kkNo, rtId),
        onSuccess: (response) => {
            toast.success('Kartu Keluarga valid!');
            
            // Invalidate related queries
            queryClient.invalidateQueries([KARTU_KELUARGA_QUERY_KEYS.KK_AVAILABILITY]);
        },
        onError: (error) => {
            console.error('KK validation failed:', error);
            
            // Handle specific validation errors sesuai backend
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message;
                if (errorMessage?.includes('16 digits')) {
                    toast.error('Nomor Kartu Keluarga harus 16 digit angka');
                } else if (errorMessage?.includes('different RT')) {
                    toast.error('Kartu Keluarga terdaftar di RT yang berbeda');
                } else if (errorMessage?.includes('not active')) {
                    toast.error('Kartu Keluarga tidak aktif');
                } else if (errorMessage?.includes('not found')) {
                    toast.error('Kartu Keluarga tidak ditemukan di sistem');
                } else {
                    toast.error(errorMessage || 'Data KK tidak valid');
                }
            } else {
                toast.error('Validasi Kartu Keluarga gagal');
            }
        }
    });

    // ===== CALLBACK FUNCTIONS =====
    
    const validateKK = useCallback((kkNo, rtId) => {
        // Client-side validation first
        const validation = kartuKeluargaService.validateKKFormat(kkNo);
        if (!validation.valid) {
            toast.error(validation.message);
            return Promise.reject(new Error(validation.message));
        }
        
        if (!rtId) {
            toast.error('RT ID wajib diisi');
            return Promise.reject(new Error('RT ID required'));
        }
        
        return validateKKMutation.mutateAsync({ 
            kkNo: validation.cleanKK, 
            rtId: parseInt(rtId) 
        });
    }, [validateKKMutation]);

    const refreshMyFamily = useCallback(() => {
        return myFamilyQuery.refetch();
    }, [myFamilyQuery]);

    const invalidateAllKKData = useCallback(() => {
        queryClient.invalidateQueries([KARTU_KELUARGA_QUERY_KEYS.MY_FAMILY]);
        queryClient.invalidateQueries([KARTU_KELUARGA_QUERY_KEYS.KK_DETAILS]);
        queryClient.invalidateQueries([KARTU_KELUARGA_QUERY_KEYS.KK_STATISTICS]);
        queryClient.invalidateQueries([KARTU_KELUARGA_QUERY_KEYS.KK_AVAILABILITY]);
    }, [queryClient]);

    // ===== UTILITY FUNCTIONS =====
    
    const formatKKNumber = useCallback((kkNo) => {
        return kartuKeluargaService.formatKKNumber(kkNo);
    }, []);

    const validateKKFormat = useCallback((kkNo) => {
        return kartuKeluargaService.validateKKFormat(kkNo);
    }, []);

    const getRelationshipText = useCallback((relationship) => {
        return kartuKeluargaService.getRelationshipText(relationship);
    }, []);

    const getRegistrationStatusText = useCallback((status) => {
        return kartuKeluargaService.getRegistrationStatusText(status);
    }, []);

    const sortMembersByHierarchy = useCallback((members) => {
        return kartuKeluargaService.sortMembersByHierarchy(members);
    }, []);

    // ===== COMPUTED VALUES =====
    
    const familyStats = useMemo(() => {
        if (!familyData) return null;
        
        return {
            total_members: familyData.total_members || 0,
            claimed_members: familyData.claimed_members?.length || 0,
            unclaimed_members: familyData.unclaimed_members?.length || 0,
            completion_percentage: familyData.total_members > 0 
                ? Math.round((familyData.claimed_members?.length || 0) / familyData.total_members * 100) 
                : 0
        };
    }, [familyData]);

    // Delete Family Member Mutation
    const deleteFamilyMemberMutation = useMutation({
        mutationFn: (ktpId) => userKtpService.deleteFamilyMember(ktpId),
        onSuccess: (response, ktpId) => {
            toast.success('Anggota keluarga berhasil dihapus');
            
            // Invalidate family data to refresh the list
            queryClient.invalidateQueries([KARTU_KELUARGA_QUERY_KEYS.MY_FAMILY]);
        },
        onError: (error) => {
            console.error('Delete family member failed:', error);
            
            if (error.response?.status === 403) {
                toast.error('Anda tidak memiliki izin untuk menghapus anggota ini');
            } else if (error.response?.status === 404) {
                toast.error('Anggota keluarga tidak ditemukan');
            } else if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message;
                if (errorMessage?.includes('cannot delete')) {
                    toast.error('Anggota ini tidak dapat dihapus');
                } else {
                    toast.error(errorMessage || 'Tidak dapat menghapus anggota keluarga');
                }
            } else {
                toast.error('Gagal menghapus anggota keluarga');
            }
        }
    });

    // Add Family Member Mutation
    const addFamilyMemberMutation = useMutation({
        mutationFn: (memberData) => userKtpService.registerFamilyMember(memberData),
        onSuccess: (response) => {
            toast.success('Anggota keluarga berhasil ditambahkan');
            
            // Invalidate family data to refresh the list
            queryClient.invalidateQueries([KARTU_KELUARGA_QUERY_KEYS.MY_FAMILY]);
        },
        onError: (error) => {
            console.error('Add family member failed:', error);
            
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message;
                if (errorMessage?.includes('NIK already exists')) {
                    toast.error('NIK sudah terdaftar dalam sistem');
                } else if (errorMessage?.includes('invalid data')) {
                    toast.error('Data yang dimasukkan tidak valid');
                } else {
                    toast.error(errorMessage || 'Data tidak valid');
                }
            } else if (error.response?.status === 403) {
                toast.error('Anda tidak memiliki izin untuk menambah anggota');
            } else {
                toast.error('Gagal menambahkan anggota keluarga');
            }
        }
    });

    // Update Family Member Mutation
    const updateFamilyMemberMutation = useMutation({
        mutationFn: ({ ktpId, updateData }) => userKtpService.updateFamilyMember(ktpId, updateData),
        onSuccess: (response) => {
            toast.success('Data anggota keluarga berhasil diperbarui');
            
            // Invalidate family data to refresh the list
            queryClient.invalidateQueries([KARTU_KELUARGA_QUERY_KEYS.MY_FAMILY]);
        },
        onError: (error) => {
            console.error('Update family member failed:', error);
            
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message;
                toast.error(errorMessage || 'Data yang dimasukkan tidak valid');
            } else if (error.response?.status === 403) {
                toast.error('Anda tidak memiliki izin untuk mengubah data anggota ini');
            } else if (error.response?.status === 404) {
                toast.error('Anggota keluarga tidak ditemukan');
            } else {
                toast.error('Gagal memperbarui data anggota keluarga');
            }
        }
    });

    // Check Delete Permission Query
    const useDeletePermission = (ktpId) => {
        return useQuery({
            queryKey: ['delete-permission', ktpId],
            queryFn: () => userKtpService.checkDeletePermission(ktpId),
            enabled: !!ktpId,
            staleTime: 30 * 1000, // 30 seconds
            onError: (error) => {
                console.error('Failed to check delete permission:', error);
            }
        });
    };

    // ===== CALLBACK FUNCTIONS =====

    const deleteFamilyMember = useCallback((ktpId) => {
        if (!ktpId) {
            toast.error('ID anggota keluarga tidak valid');
            return Promise.reject(new Error('Invalid KTP ID'));
        }
        
        return deleteFamilyMemberMutation.mutateAsync(ktpId);
    }, [deleteFamilyMemberMutation]);

    const addFamilyMember = useCallback((memberData) => {
        if (!memberData) {
            toast.error('Data anggota keluarga wajib diisi');
            return Promise.reject(new Error('Member data required'));
        }
        
        return addFamilyMemberMutation.mutateAsync(memberData);
    }, [addFamilyMemberMutation]);

    const updateFamilyMember = useCallback(({ ktpId, updateData }) => {
        if (!ktpId || !updateData) {
            toast.error('Data tidak lengkap');
            return Promise.reject(new Error('Incomplete data'));
        }
        
        return updateFamilyMemberMutation.mutateAsync({ ktpId, updateData });
    }, [updateFamilyMemberMutation]);

    const canDeleteMember = useCallback((member) => {
        if (!member) return false;
        
        // Cannot delete head of family
        if (member.is_kepala_keluarga) {
            return false;
        }
        
        // Cannot delete members who already have user accounts
        if (member.has_user_account) {
            return false;
        }
        
        return true;
    }, []);

// Tambahkan di return object, ganti yang sebelumnya
return {
     // Family data
    familyData,
    familyStats,
    familyLoading: myFamilyQuery.isLoading,
    familyError: myFamilyQuery.error,
    refreshMyFamily,

    // Mutations
    validateKK,
    isValidatingKK: validateKKMutation.isLoading,
    validateKKError: validateKKMutation.error,

    // Query hooks for components
    useKKDetails,
    useKKStatistics,
    useKKAvailability,

    // Utility functions
    formatKKNumber,
    validateKKFormat,
    getRelationshipText,
    getRegistrationStatusText,
    sortMembersByHierarchy,

    // Cache management
    invalidateAllKKData,
    queryClient,
    
    // Family member operations
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    canDeleteMember,
    
    // Query hooks
    useDeletePermission,
    
    // Loading states
    isAddingMember: addFamilyMemberMutation.isLoading,
    isUpdatingMember: updateFamilyMemberMutation.isLoading,
    isDeletingMember: deleteFamilyMemberMutation.isLoading,
    
    // Error states
    addMemberError: addFamilyMemberMutation.error,
    updateMemberError: updateFamilyMemberMutation.error,
    deleteMemberError: deleteFamilyMemberMutation.error,
    
    // ... rest of existing returns
};

    // ===== RETURN OBJECT =====
    // return {
    //     // Family data
    //     familyData,
    //     familyStats,
    //     familyLoading: myFamilyQuery.isLoading,
    //     familyError: myFamilyQuery.error,
    //     refreshMyFamily,

    //     // Mutations
    //     validateKK,
    //     isValidatingKK: validateKKMutation.isLoading,
    //     validateKKError: validateKKMutation.error,

    //     // Query hooks for components
    //     useKKDetails,
    //     useKKStatistics,
    //     useKKAvailability,

    //     // Utility functions
    //     formatKKNumber,
    //     validateKKFormat,
    //     getRelationshipText,
    //     getRegistrationStatusText,
    //     sortMembersByHierarchy,

    //     // Cache management
    //     invalidateAllKKData,
    //     queryClient
    // };
};