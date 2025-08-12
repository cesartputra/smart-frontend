// src/hooks/useSuratPengantar.js - OPTIMIZED VERSION
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

export const useSuratPengantar = () => {
    const queryClient = useQueryClient();
    const [selectedFilters, setSelectedFilters] = useState({
        status: '',
        period: 'month',
        rwId: '',
        rtId: ''
    });

    // ===== CATEGORIES =====
    const categoriesQuery = useQuery({
        queryKey: [QUERY_KEYS.CATEGORIES],
        queryFn: suratPengantarService.getCategories,
        staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
        cacheTime: 30 * 60 * 1000, // 30 minutes
        retry: 3,
        onError: (error) => {
        console.error('Failed to fetch categories:', error);
        toast.error('Gagal memuat kategori surat');
        }
    });

    // Memoized categories data
    const categories = useMemo(() => 
        categoriesQuery.data?.data?.categories || categoriesQuery.data?.categories || [], 
        [categoriesQuery.data]
    );

    // ===== MY REQUESTS =====
    const myRequestsQuery = useQuery({
        queryKey: [QUERY_KEYS.MY_REQUESTS, selectedFilters],
        queryFn: ({ queryKey }) => {
        const [, filters] = queryKey;
        return suratPengantarService.getMyRequests(filters);
        },
        staleTime: 30 * 1000, // 30 seconds
        keepPreviousData: true,
        onError: (error) => {
        console.error('Failed to fetch my requests:', error);
        toast.error('Gagal memuat daftar pengajuan');
        }
    });

    // ===== MUTATIONS =====
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
            window.location.href = `/surat-pengantar/${response.data.id}`;
        }
        },
        onError: (error) => {
        console.error('Failed to create request:', error);
        const message = error.response?.data?.message || 'Gagal membuat pengajuan';
        toast.error(message);
        }
    });

    const rtApprovalMutation = useMutation({
        mutationFn: ({ id, data }) => suratPengantarService.rtApproval(id, data),
        onSuccess: (response) => {
        // Invalidate multiple related queries
        queryClient.invalidateQueries([QUERY_KEYS.PENDING_RT]);
        queryClient.invalidateQueries([QUERY_KEYS.PENDING_RW]);
        queryClient.invalidateQueries([QUERY_KEYS.RT_STATISTICS]);
        queryClient.invalidateQueries([QUERY_KEYS.MY_REQUESTS]);
        
        const action = response?.data?.action === 'A' ? 'disetujui' : 'ditolak';
        toast.success(`Pengajuan berhasil ${action}!`);
        },
        onError: (error) => {
        console.error('Failed RT approval:', error);
        const message = error.response?.data?.message || 'Gagal memproses persetujuan';
        toast.error(message);
        }
    });

    const rwApprovalMutation = useMutation({
        mutationFn: ({ id, data }) => suratPengantarService.rwApproval(id, data),
        onSuccess: (response) => {
        queryClient.invalidateQueries([QUERY_KEYS.PENDING_RW]);
        queryClient.invalidateQueries([QUERY_KEYS.RW_STATISTICS]);
        queryClient.invalidateQueries([QUERY_KEYS.ADMIN_STATISTICS]);
        queryClient.invalidateQueries([QUERY_KEYS.MY_REQUESTS]);
        
        const action = response?.data?.action === 'A' ? 'disetujui dan diselesaikan' : 'ditolak';
        toast.success(`Pengajuan berhasil ${action}!`);
        },
        onError: (error) => {
        console.error('Failed RW approval:', error);
        const message = error.response?.data?.message || 'Gagal memproses persetujuan';
        toast.error(message);
        }
    });

    // ===== CALLBACK FUNCTIONS =====
    const fetchMyRequests = useCallback((filters = {}) => {
        setSelectedFilters(prev => ({ ...prev, ...filters }));
    }, []);

    const createRequest = useCallback((data) => {
        createRequestMutation.mutate(data);
    }, [createRequestMutation]);

    const rtApproval = useCallback((data) => {
        rtApprovalMutation.mutate(data);
    }, [rtApprovalMutation]);

    const rwApproval = useCallback((data) => {
        rwApprovalMutation.mutate(data);
    }, [rwApprovalMutation]);

    // Download PDF with optimized error handling
    const downloadPDF = useCallback(async (id) => {
        try {
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
        
        toast.success('File PDF berhasil diunduh!');
        } catch (error) {
        console.error('Download failed:', error);
        toast.error('Gagal mengunduh file PDF');
        }
    }, []);

    // ===== DETAIL QUERY WITH OPTIMIZED CACHING =====
    const useDetailQuery = (id) => {
        return useQuery({
        queryKey: [QUERY_KEYS.DETAIL, id],
        queryFn: () => suratPengantarService.getDetail(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes
        onError: (error) => {
            console.error('Failed to fetch detail:', error);
            toast.error('Gagal memuat detail surat pengantar');
        }
        });
    };

    // ===== STATISTICS QUERIES =====
    const useStatistics = (params = {}) => {
        return useQuery({
        queryKey: [QUERY_KEYS.RT_STATISTICS, params],
        queryFn: () => suratPengantarService.getRTStatistics(params),
        staleTime: 2 * 60 * 1000,
        onError: (error) => {
            console.error('Failed to fetch statistics:', error);
            toast.error('Gagal memuat statistik');
        }
        });
    };

    // ===== PENDING REQUESTS QUERIES =====
    const usePendingRT = (params = {}) => {
        return useQuery({
        queryKey: [QUERY_KEYS.PENDING_RT, params],
        queryFn: () => suratPengantarService.getPendingForRT(params),
        staleTime: 30 * 1000, // 30 seconds - needs to be fresh
        keepPreviousData: true,
        onError: (error) => {
            console.error('Failed to fetch pending RT:', error);
            toast.error('Gagal memuat pengajuan pending RT');
        }
        });
    };

    const usePendingRW = (params = {}) => {
        return useQuery({
        queryKey: [QUERY_KEYS.PENDING_RW, params],
        queryFn: () => suratPengantarService.getPendingForRW(params),
        staleTime: 30 * 1000,
        keepPreviousData: true,
        onError: (error) => {
            console.error('Failed to fetch pending RW:', error);
            toast.error('Gagal memuat pengajuan pending RW');
        }
        });
    };

    // ===== RETURN OPTIMIZED OBJECT =====
    return {
        // Categories
        categories,
        categoriesLoading: categoriesQuery.isLoading,
        categoriesError: categoriesQuery.error,
        fetchCategories: categoriesQuery.refetch,

        // My Requests
        myRequests: myRequestsQuery.data || { data: [], pagination: {} },
        myRequestsLoading: myRequestsQuery.isLoading,
        myRequestsError: myRequestsQuery.error,
        fetchMyRequests,

        // Mutations
        createRequest,
        isCreating: createRequestMutation.isLoading,
        
        rtApproval,
        isRTProcessing: rtApprovalMutation.isLoading,
        
        rwApproval,
        isRWProcessing: rwApprovalMutation.isLoading,

        // Utilities
        downloadPDF,
        isDownloading: false, // Could be managed with separate state if needed

        // Query hooks for components to use
        useDetailQuery,
        useStatistics,
        usePendingRT,
        usePendingRW,

        // Query client for manual cache management
        queryClient
    };
};