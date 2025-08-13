// src/hooks/useKartuKeluarga.js - FIXED TO MATCH BACKEND ENDPOINTS
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import kartuKeluargaService from '../services/kartuKeluargaService';

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
        const members = data.members || [];
        
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

    // ===== RETURN OBJECT =====
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
        queryClient
    };
};