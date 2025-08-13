// src/hooks/useSuratPengantar.js - REFACTORED VERSION
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import suratPengantarService from '../services/SuratPengantarService';

// Query keys untuk konsistensi dan invalidation
export const QUERY_KEYS = {
    CATEGORIES: 'surat-pengantar-categories',
    MY_REQUESTS: 'my-surat-pengantar-requests',
    DETAIL: 'surat-pengantar-detail',
    PENDING_RT: 'pending-rt-requests',
    PENDING_RW: 'pending-rw-requests',
    RT_STATISTICS: 'rt-statistics',
    RW_STATISTICS: 'rw-statistics',
    ADMIN_STATISTICS: 'admin-statistics',
};

// Custom hook untuk parameter validation
const useValidatedParams = (params) => {
    return useMemo(() => {
        const validated = {};
        
        // Validate page
        if (params.page !== undefined) {
        const page = parseInt(params.page);
        if (!isNaN(page) && page >= 1) {
            validated.page = page;
        }
        }
        
        // Validate limit
        if (params.limit !== undefined) {
        const limit = parseInt(params.limit);
        if (!isNaN(limit) && limit >= 1 && limit <= 100) {
            validated.limit = limit;
        }
        }
        
        // Validate status
        if (params.status) {
        const validStatuses = ['DRAFT', 'SUBMITTED', 'RT_APPROVED', 'RW_APPROVED', 'COMPLETED', 'REJECTED'];
        if (validStatuses.includes(params.status)) {
            validated.status = params.status;
        }
        }
        
        // Add other filters
        if (params.search && typeof params.search === 'string' && params.search.trim()) {
        validated.search = params.search.trim();
        }
        
        if (params.categoryId) {
        const categoryId = parseInt(params.categoryId);
        if (!isNaN(categoryId)) {
            validated.categoryId = categoryId;
        }
        }
        
        if (params.sortBy && typeof params.sortBy === 'string') {
        validated.sortBy = params.sortBy;
        }
        
        if (params.sortOrder && ['asc', 'desc'].includes(params.sortOrder.toLowerCase())) {
        validated.sortOrder = params.sortOrder.toLowerCase();
        }
        
        return validated;
    }, [params]);
    };

    export const useSuratPengantar = () => {
    const queryClient = useQueryClient();

    // ===== CATEGORIES =====
    const categoriesQuery = useQuery({
        queryKey: [QUERY_KEYS.CATEGORIES],
        queryFn: suratPengantarService.getCategories,
        staleTime: 10 * 60 * 1000, // 10 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
        retry: 3,
        onError: (error) => {
        console.error('Failed to fetch categories:', error);
        toast.error('Gagal memuat kategori surat');
        }
    });

    // Memoized categories data dengan proper fallback
    const categories = useMemo(() => {
        const data = categoriesQuery.data;
        if (!data) return [];
        
        // Handle different response structures
        if (data.success && data.data?.categories) {
        return data.data.categories;
        }
        if (data.categories) {
        return data.categories;
        }
        if (Array.isArray(data)) {
        return data;
        }
        
        return [];
    }, [categoriesQuery.data]);

    // ===== MY REQUESTS dengan Custom Hook =====
    const useMyRequests = (params = {}) => {
        const validatedParams = useValidatedParams(params);
        
        return useQuery({
        queryKey: [QUERY_KEYS.MY_REQUESTS, validatedParams],
        queryFn: () => suratPengantarService.getMyRequests(validatedParams),
        staleTime: 30 * 1000, // 30 seconds
        keepPreviousData: true,
        onError: (error) => {
            console.error('Failed to fetch my requests:', error);
            
            // Handle specific error messages
            if (error.message.includes('positive integer')) {
            toast.error('Nomor halaman harus berupa angka positif');
            } else if (error.message.includes('between 1-100')) {
            toast.error('Limit harus antara 1-100');
            } else if (error.message.includes('Invalid status')) {
            toast.error('Status yang dipilih tidak valid');
            } else {
            toast.error('Gagal memuat daftar pengajuan');
            }
        }
        });
    };

    // ===== MUTATIONS dengan Enhanced Error Handling =====
    const createRequestMutation = useMutation({
        mutationFn: suratPengantarService.createRequest,
        onSuccess: (response) => {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries([QUERY_KEYS.MY_REQUESTS]);
        queryClient.invalidateQueries([QUERY_KEYS.RT_STATISTICS]);
        queryClient.invalidateQueries([QUERY_KEYS.PENDING_RT]);
        
        toast.success('Pengajuan surat pengantar berhasil dibuat!');
        
        // Navigate to detail page if response includes ID
        if (response?.data?.id) {
            // Use router navigation instead of direct window.location
            setTimeout(() => {
            window.location.href = `/surat-pengantar/${response.data.id}`;
            }, 1000);
        }
        },
        onError: (error) => {
        console.error('Failed to create request:', error);
        
        // Handle specific validation errors
        if (error.response?.status === 400) {
            const errorData = error.response.data;
            if (errorData.errors && Array.isArray(errorData.errors)) {
            // Handle validation errors array
            errorData.errors.forEach(err => {
                toast.error(err.msg || err.message || 'Error validasi');
            });
            } else {
            toast.error(errorData.message || 'Data yang diinput tidak valid');
            }
        } else if (error.response?.status === 403) {
            toast.error('Anda tidak memiliki akses untuk membuat pengajuan');
        } else {
            toast.error('Gagal membuat pengajuan. Silakan coba lagi.');
        }
        }
    });

    const rtApprovalMutation = useMutation({
        mutationFn: ({ id, data }) => suratPengantarService.rtApproval(id, data),
        onSuccess: (response, variables) => {
        // Invalidate multiple related queries
        queryClient.invalidateQueries([QUERY_KEYS.PENDING_RT]);
        queryClient.invalidateQueries([QUERY_KEYS.PENDING_RW]);
        queryClient.invalidateQueries([QUERY_KEYS.RT_STATISTICS]);
        queryClient.invalidateQueries([QUERY_KEYS.MY_REQUESTS]);
        
        const action = variables.data.action === 'A' ? 'disetujui' : 'ditolak';
        toast.success(`Pengajuan berhasil ${action}!`);
        },
        onError: (error) => {
        console.error('Failed RT approval:', error);
        
        if (error.message.includes('Action must be either')) {
            toast.error('Aksi yang dipilih tidak valid');
        } else if (error.message.includes('Notes are required')) {
            toast.error('Catatan wajib diisi untuk penolakan');
        } else if (error.response?.status === 404) {
            toast.error('Pengajuan tidak ditemukan');
        } else if (error.response?.status === 403) {
            toast.error('Anda tidak memiliki akses untuk memproses pengajuan ini');
        } else {
            toast.error('Gagal memproses persetujuan. Silakan coba lagi.');
        }
        }
    });

    const rwApprovalMutation = useMutation({
        mutationFn: ({ id, data }) => suratPengantarService.rwApproval(id, data),
        onSuccess: (response, variables) => {
        queryClient.invalidateQueries([QUERY_KEYS.PENDING_RW]);
        queryClient.invalidateQueries([QUERY_KEYS.RW_STATISTICS]);
        queryClient.invalidateQueries([QUERY_KEYS.ADMIN_STATISTICS]);
        queryClient.invalidateQueries([QUERY_KEYS.MY_REQUESTS]);
        
        const action = variables.data.action === 'A' ? 'disetujui dan diselesaikan' : 'ditolak';
        toast.success(`Pengajuan berhasil ${action}!`);
        },
        onError: (error) => {
        console.error('Failed RW approval:', error);
        
        if (error.message.includes('Action must be either')) {
            toast.error('Aksi yang dipilih tidak valid');
        } else if (error.message.includes('Notes are required')) {
            toast.error('Catatan wajib diisi untuk penolakan');
        } else if (error.response?.status === 404) {
            toast.error('Pengajuan tidak ditemukan');
        } else if (error.response?.status === 403) {
            toast.error('Anda tidak memiliki akses untuk memproses pengajuan ini');
        } else {
            toast.error('Gagal memproses persetujuan. Silakan coba lagi.');
        }
        }
    });

    // ===== CALLBACK FUNCTIONS =====
    const createRequest = useCallback((data) => {
        // Client-side validation sebelum submit
        if (!data.surat_pengantar_category_id) {
        toast.error('Kategori surat harus dipilih');
        return;
        }
        
        if (!data.user_ktp_id) {
        toast.error('Pemohon harus dipilih');
        return;
        }
        
        if (!data.reason || data.reason.trim().length < 10) {
        toast.error('Alasan pengajuan minimal 10 karakter');
        return;
        }
        
        if (data.reason.trim().length > 500) {
        toast.error('Alasan pengajuan maksimal 500 karakter');
        return;
        }
        
        createRequestMutation.mutate(data);
    }, [createRequestMutation]);

    const rtApproval = useCallback((data) => {
        // Client-side validation
        if (!data.id) {
        toast.error('ID pengajuan tidak valid');
        return;
        }
        
        if (!data.data?.action || !['A', 'R'].includes(data.data.action)) {
        toast.error('Aksi harus dipilih');
        return;
        }
        
        if (data.data.action === 'R' && (!data.data.notes || !data.data.notes.trim())) {
        toast.error('Catatan wajib diisi untuk penolakan');
        return;
        }
        
        rtApprovalMutation.mutate(data);
    }, [rtApprovalMutation]);

    const rwApproval = useCallback((data) => {
        // Client-side validation
        if (!data.id) {
        toast.error('ID pengajuan tidak valid');
        return;
        }
        
        if (!data.data?.action || !['A', 'R'].includes(data.data.action)) {
        toast.error('Aksi harus dipilih');
        return;
        }
        
        if (data.data.action === 'R' && (!data.data.notes || !data.data.notes.trim())) {
        toast.error('Catatan wajib diisi untuk penolakan');
        return;
        }
        
        rwApprovalMutation.mutate(data);
    }, [rwApprovalMutation]);

    // Download PDF dengan enhanced error handling
    const downloadPDF = useCallback(async (id) => {
        if (!id) {
        toast.error('ID tidak valid');
        return;
        }
        
        try {
        toast.loading('Mempersiapkan unduhan...', { id: 'download-pdf' });
        
        const response = await suratPengantarService.downloadPDF(id);
        
        // Create blob and download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `surat-pengantar-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('File PDF berhasil diunduh!', { id: 'download-pdf' });
        } catch (error) {
        console.error('Download failed:', error);
        
        if (error.message.includes('tidak ditemukan')) {
            toast.error('File PDF tidak ditemukan', { id: 'download-pdf' });
        } else if (error.message.includes('tidak memiliki akses')) {
            toast.error('Anda tidak memiliki akses untuk mengunduh file ini', { id: 'download-pdf' });
        } else {
            toast.error('Gagal mengunduh file PDF', { id: 'download-pdf' });
        }
        }
    }, []);

    // ===== DETAIL QUERY =====
    const useDetailQuery = (id) => {
        return useQuery({
        queryKey: [QUERY_KEYS.DETAIL, id],
        queryFn: () => suratPengantarService.getDetail(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes
        onError: (error) => {
            console.error('Failed to fetch detail:', error);
            
            if (error.message.includes('tidak ditemukan')) {
            toast.error('Surat pengantar tidak ditemukan');
            } else {
            toast.error('Gagal memuat detail surat pengantar');
            }
        }
        });
    };

    // ===== STATISTICS QUERIES =====
    const useStatistics = (params = {}) => {
        const validatedParams = useMemo(() => {
        const validated = {};
        
        if (params.period && ['week', 'month', 'quarter', 'year'].includes(params.period)) {
            validated.period = params.period;
        }
        
        if (params.rwId) {
            const rwId = parseInt(params.rwId);
            if (!isNaN(rwId)) {
            validated.rwId = rwId;
            }
        }
        
        if (params.rtId) {
            const rtId = parseInt(params.rtId);
            if (!isNaN(rtId)) {
            validated.rtId = rtId;
            }
        }
        
        return validated;
        }, [params]);

        return useQuery({
        queryKey: [QUERY_KEYS.RT_STATISTICS, validatedParams],
        queryFn: () => suratPengantarService.getRTStatistics(validatedParams),
        staleTime: 2 * 60 * 1000,
        onError: (error) => {
            console.error('Failed to fetch statistics:', error);
            toast.error('Gagal memuat statistik');
        }
        });
    };

    // ===== PENDING REQUESTS QUERIES =====
    const usePendingRT = (params = {}) => {
        const validatedParams = useValidatedParams(params);
        
        return useQuery({
        queryKey: [QUERY_KEYS.PENDING_RT, validatedParams],
        queryFn: () => suratPengantarService.getPendingForRT(validatedParams),
        staleTime: 30 * 1000, // 30 seconds - needs to be fresh
        keepPreviousData: true,
        onError: (error) => {
            console.error('Failed to fetch pending RT:', error);
            
            if (error.message.includes('positive integer')) {
            toast.error('Nomor halaman harus berupa angka positif');
            } else if (error.message.includes('between 1-100')) {
            toast.error('Limit harus antara 1-100');
            } else {
            toast.error('Gagal memuat pengajuan pending RT');
            }
        }
        });
    };

    const usePendingRW = (params = {}) => {
        const validatedParams = useValidatedParams(params);
        
        return useQuery({
        queryKey: [QUERY_KEYS.PENDING_RW, validatedParams],
        queryFn: () => suratPengantarService.getPendingForRW(validatedParams),
        staleTime: 30 * 1000,
        keepPreviousData: true,
        onError: (error) => {
            console.error('Failed to fetch pending RW:', error);
            
            if (error.message.includes('positive integer')) {
            toast.error('Nomor halaman harus berupa angka positif');
            } else if (error.message.includes('between 1-100')) {
            toast.error('Limit harus antara 1-100');
            } else {
            toast.error('Gagal memuat pengajuan pending RW');
            }
        }
        });
    };

    // ===== ADMIN STATISTICS =====
    const useAdminStatistics = (params = {}) => {
        const validatedParams = useMemo(() => {
        const validated = {};
        
        if (params.period && ['week', 'month', 'quarter', 'year'].includes(params.period)) {
            validated.period = params.period;
        }
        
        if (params.rwId) {
            const rwId = parseInt(params.rwId);
            if (!isNaN(rwId)) {
            validated.rwId = rwId;
            }
        }
        
        if (params.rtId) {
            const rtId = parseInt(params.rtId);
            if (!isNaN(rtId)) {
            validated.rtId = rtId;
            }
        }
        
        if (params.status) {
            const validStatuses = ['DRAFT', 'SUBMITTED', 'RT_APPROVED', 'RW_APPROVED', 'COMPLETED', 'REJECTED'];
            if (validStatuses.includes(params.status)) {
            validated.status = params.status;
            }
        }
        
        if (params.search && typeof params.search === 'string' && params.search.trim()) {
            validated.search = params.search.trim();
        }
        
        return validated;
        }, [params]);

        return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_STATISTICS, validatedParams],
        queryFn: () => suratPengantarService.getAdminStatistics(validatedParams),
        staleTime: 2 * 60 * 1000,
        onError: (error) => {
            console.error('Failed to fetch admin statistics:', error);
            toast.error('Gagal memuat statistik admin');
        }
        });
    };

    // ===== UTILITY FUNCTIONS =====
    const fetchCategories = useCallback(() => {
        return categoriesQuery.refetch();
    }, [categoriesQuery]);

    const invalidateMyRequests = useCallback(() => {
        queryClient.invalidateQueries([QUERY_KEYS.MY_REQUESTS]);
    }, [queryClient]);

    const invalidateAllQueries = useCallback(() => {
        queryClient.invalidateQueries();
    }, [queryClient]);

    // ===== RETURN OPTIMIZED OBJECT =====
    return {
        // Categories
        categories,
        categoriesLoading: categoriesQuery.isLoading,
        categoriesError: categoriesQuery.error,
        fetchCategories,

        // Mutations
        createRequest,
        isCreating: createRequestMutation.isLoading,
        createError: createRequestMutation.error,
        
        rtApproval,
        isRTProcessing: rtApprovalMutation.isLoading,
        rtError: rtApprovalMutation.error,
        
        rwApproval,
        isRWProcessing: rwApprovalMutation.isLoading,
        rwError: rwApprovalMutation.error,

        // Utilities
        downloadPDF,

        // Query hooks for components to use
        useMyRequests,
        useDetailQuery,
        useStatistics,
        usePendingRT,
        usePendingRW,
        useAdminStatistics,

        // Helper functions
        invalidateMyRequests,
        invalidateAllQueries,

        // Query client for manual cache management
        queryClient,

        // Status validation helper
        validateStatus: useCallback((status) => {
        const validStatuses = ['DRAFT', 'SUBMITTED', 'RT_APPROVED', 'RW_APPROVED', 'COMPLETED', 'REJECTED'];
        return validStatuses.includes(status);
        }, []),

        // Pagination helper
        validatePagination: useCallback((page, limit) => {
        const validPage = parseInt(page);
        const validLimit = parseInt(limit);
        
        return {
            page: (!isNaN(validPage) && validPage >= 1) ? validPage : 1,
            limit: (!isNaN(validLimit) && validLimit >= 1 && validLimit <= 100) ? validLimit : 10
        };
        }, [])
    };
};