// src/hooks/useSuratPengantar.js
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import suratPengantarService from '../services/suratPengantarService';

export const useSuratPengantar = () => {
    const navigate = useNavigate();

    // Get categories query
    const categoriesQuery = useQuery({
        queryKey: ['surat-pengantar-categories'],
        queryFn: suratPengantarService.getCategories,
        retry: 2,
        onError: (error) => {
            console.error('❌ Categories query error:', error);
        }
    });

    // Create request mutation
    const createRequestMutation = useMutation({
        mutationFn: suratPengantarService.createRequest,
        onSuccess: (data) => {
            console.log('✅ Surat pengantar created successfully:', data);
            toast.success('Pengajuan surat pengantar berhasil dibuat!');
            navigate('/surat-pengantar');
        },
        onError: (error) => {
            console.error('❌ Create request error:', error);
            const message = error.response?.data?.message || 'Gagal membuat pengajuan surat pengantar';
            toast.error(message);
        },
    });

    // Get my requests query
    const myRequestsQuery = useQuery({
        queryKey: ['my-surat-pengantar-requests'],
        queryFn: () => suratPengantarService.getMyRequests(),
        enabled: false, // Only fetch when explicitly called
        retry: 2,
        onError: (error) => {
            console.error('❌ My requests query error:', error);
        }
    });

    // Get detail query
    const detailQuery = useQuery({
        queryKey: ['surat-pengantar-detail'],
        queryFn: () => null,
        enabled: false, // Only fetch when explicitly called
        retry: 2,
        onError: (error) => {
            console.error('❌ Detail query error:', error);
        }
    });

    // Download PDF mutation
    const downloadPDFMutation = useMutation({
        mutationFn: suratPengantarService.downloadPDF,
        onSuccess: (response, id) => {
            console.log('✅ PDF downloaded successfully');
            
            // Create blob URL and download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Get filename from headers or use default
            const contentDisposition = response.headers['content-disposition'];
            let filename = `surat-pengantar-${id}.pdf`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success('PDF berhasil diunduh!');
        },
        onError: (error) => {
            console.error('❌ Download PDF error:', error);
            const message = error.response?.data?.message || 'Gagal mengunduh PDF';
            toast.error(message);
        },
    });

    // RT Management hooks
    const pendingRTQuery = useQuery({
        queryKey: ['pending-rt-requests'],
        queryFn: () => suratPengantarService.getPendingForRT(),
        enabled: false,
        retry: 2,
        onError: (error) => {
            console.error('❌ Pending RT query error:', error);
        }
    });

    const rtApprovalMutation = useMutation({
        mutationFn: ({ id, data }) => suratPengantarService.rtApproval(id, data),
        onSuccess: (data) => {
            console.log('✅ RT approval successful:', data);
            toast.success(data.message || 'Persetujuan RT berhasil!');
            // Refresh pending requests
            pendingRTQuery.refetch();
        },
        onError: (error) => {
            console.error('❌ RT approval error:', error);
            const message = error.response?.data?.message || 'Gagal memproses persetujuan RT';
            toast.error(message);
        },
    });

    // RW Management hooks
    const pendingRWQuery = useQuery({
        queryKey: ['pending-rw-requests'],
        queryFn: () => suratPengantarService.getPendingForRW(),
        enabled: false,
        retry: 2,
        onError: (error) => {
            console.error('❌ Pending RW query error:', error);
        }
    });

    const rwApprovalMutation = useMutation({
        mutationFn: ({ id, data }) => suratPengantarService.rwApproval(id, data),
        onSuccess: (data) => {
            console.log('✅ RW approval successful:', data);
            toast.success(data.message || 'Persetujuan RW berhasil!');
            // Refresh pending requests
            pendingRWQuery.refetch();
        },
        onError: (error) => {
            console.error('❌ RW approval error:', error);
            const message = error.response?.data?.message || 'Gagal memproses persetujuan RW';
            toast.error(message);
        },
    });

    // Statistics query
    const statisticsQuery = useQuery({
        queryKey: ['surat-pengantar-statistics'],
        queryFn: () => suratPengantarService.getRTStatistics(),
        enabled: false,
        retry: 2,
        onError: (error) => {
            console.error('❌ Statistics query error:', error);
        }
    });

    // QR Code verification mutation
    const verifyQRMutation = useMutation({
        mutationFn: suratPengantarService.verifyQRCode,
        onSuccess: (data) => {
            console.log('✅ QR verification successful:', data);
            toast.success('QR Code valid!');
        },
        onError: (error) => {
            console.error('❌ QR verification error:', error);
            const message = error.message || 'QR Code tidak valid';
            toast.error(message);
        },
    });

    return {
        // Categories
        categories: categoriesQuery.data?.categories || [],
        categoriesLoading: categoriesQuery.isFetching,
        fetchCategories: categoriesQuery.refetch,

        // Create request
        createRequest: createRequestMutation.mutate,
        isCreating: createRequestMutation.isPending,

        // My requests
        myRequests: myRequestsQuery.data || {},
        myRequestsLoading: myRequestsQuery.isFetching,
        fetchMyRequests: (params) => {
            myRequestsQuery.refetch({
                queryFn: () => suratPengantarService.getMyRequests(params)
            });
        },

        // Detail
        detail: detailQuery.data?.suratPengantar,
        detailLoading: detailQuery.isFetching,
        fetchDetail: (id) => {
            detailQuery.refetch({
                queryFn: () => suratPengantarService.getDetail(id)
            });
        },

        // Download PDF
        downloadPDF: downloadPDFMutation.mutate,
        isDownloading: downloadPDFMutation.isPending,

        // RT Management
        pendingRTRequests: pendingRTQuery.data || {},
        pendingRTLoading: pendingRTQuery.isFetching,
        fetchPendingRT: (params) => {
            pendingRTQuery.refetch({
                queryFn: () => suratPengantarService.getPendingForRT(params)
            });
        },
        rtApproval: rtApprovalMutation.mutate,
        isRTProcessing: rtApprovalMutation.isPending,

        // RW Management
        pendingRWRequests: pendingRWQuery.data || {},
        pendingRWLoading: pendingRWQuery.isFetching,
        fetchPendingRW: (params) => {
            pendingRWQuery.refetch({
                queryFn: () => suratPengantarService.getPendingForRW(params)
            });
        },
        rwApproval: rwApprovalMutation.mutate,
        isRWProcessing: rwApprovalMutation.isPending,

        // Statistics
        statistics: statisticsQuery.data || {},
        statisticsLoading: statisticsQuery.isFetching,
        fetchStatistics: (params) => {
            statisticsQuery.refetch({
                queryFn: () => suratPengantarService.getRTStatistics(params)
            });
        },

        // QR Verification
        verifyQR: verifyQRMutation.mutate,
        qrResult: verifyQRMutation.data,
        isVerifying: verifyQRMutation.isPending,
    };
};