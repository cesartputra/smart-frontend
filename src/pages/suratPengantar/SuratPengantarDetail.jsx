// src/pages/suratPengantar/SuratPengantarDetail.jsx - REFACTORED VERSION
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
    ArrowLeft, 
    FileText, 
    User, 
    Calendar, 
    MapPin, 
    Download, 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    Shield,
    QrCode
} from 'lucide-react';
import { useSuratPengantar } from '../../hooks/useSuratPengantar';
import { StatusBadge } from '../../components/suratPengantar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Status configuration constants
const STATUS_CONFIG = {
    'DRAFT': {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: Clock,
        text: 'Draft'
    },
    'SUBMITTED': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Clock,
        text: 'Menunggu RT'
    },
    'RT_APPROVED': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertCircle,
        text: 'Menunggu RW'
    },
    'COMPLETED': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        text: 'Selesai'
    },
    'REJECTED': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        text: 'Ditolak'
    }
};

// Document Information Component
const DocumentInfo = React.memo(({ detail }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
            📄 Informasi Dokumen
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                    Kategori Surat
                </label>
                <p className="text-gray-900 font-medium">{detail.category_name}</p>
                {detail.category_description && (
                    <p className="text-sm text-gray-600 mt-1">{detail.category_description}</p>
                )}
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                    Estimasi Proses
                </label>
                <div className="flex items-center text-gray-900">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {detail.processing_days ? `${detail.processing_days} hari kerja` : 'Tidak ditentukan'}
                </div>
            </div>
        </div>

        <div className="mt-6">
            <label className="block text-sm font-medium text-gray-500 mb-2">
                Alasan Pengajuan
            </label>
            <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800">{detail.reason}</p>
            </div>
        </div>
    </div>
));

// Applicant Information Component
const ApplicantInfo = React.memo(({ detail }) => {
    const formatDate = useCallback((dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }, []);

    const formatNIK = useCallback((nik) => {
        if (!nik) return '-';
        return nik.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-$2-$3-$4');
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                👤 Data Pemohon
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                        Nama Lengkap
                    </label>
                    <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <p className="text-gray-900 font-medium">{detail.full_name}</p>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                        NIK
                    </label>
                    <p className="text-gray-900 font-mono">
                        {formatNIK(detail.nik)}
                    </p>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                        Tempat, Tanggal Lahir
                    </label>
                    <p className="text-gray-900">
                        {detail.pob}, {formatDate(detail.dob)}
                    </p>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                        Jenis Kelamin
                    </label>
                    <p className="text-gray-900">{detail.sex === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                        Pekerjaan
                    </label>
                    <p className="text-gray-900">{detail.occupation}</p>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                        Status Perkawinan
                    </label>
                    <p className="text-gray-900">{detail.marital_status}</p>
                </div>
            </div>

            <div className="mt-6">
                <label className="block text-sm font-medium text-gray-500 mb-2">
                    Alamat
                </label>
                <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                        <p className="text-gray-900">{detail.address}</p>
                        <p className="text-sm text-gray-600 mt-1">
                            RT {detail.rt_no?.toString().padStart(2, '0')} / 
                            RW {detail.rw_no?.toString().padStart(2, '0')}, {detail.kelurahan_name}, {detail.kecamatan_name}, {detail.city_name}, {detail.province_name}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
});

// Approval Notes Component
const ApprovalNotes = React.memo(({ detail }) => {
    if (!detail.rt_notes && !detail.rw_notes) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                💬 Catatan Persetujuan
            </h3>
            
            {detail.rt_notes && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-2">
                        <Shield className="h-4 w-4 mr-2 text-blue-600" />
                        <h4 className="font-medium text-blue-900">Catatan RT</h4>
                    </div>
                    <p className="text-blue-800">{detail.rt_notes}</p>
                    {detail.rt_approver_name && (
                        <p className="text-xs text-blue-600 mt-2">
                            oleh: {detail.rt_approver_name}
                        </p>
                    )}
                </div>
            )}
            
            {detail.rw_notes && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center mb-2">
                        <Shield className="h-4 w-4 mr-2 text-green-600" />
                        <h4 className="font-medium text-green-900">Catatan RW</h4>
                    </div>
                    <p className="text-green-800">{detail.rw_notes}</p>
                    {detail.rw_approver_name && (
                        <p className="text-xs text-green-600 mt-2">
                            oleh: {detail.rw_approver_name}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
});

// Quick Actions Component
const QuickActions = React.memo(({ detail, onDownload, isDownloading }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🚀 Aksi Cepat
        </h3>
        
        <div className="space-y-3">
            {detail.status === 'COMPLETED' && (
                <button
                    onClick={onDownload}
                    disabled={isDownloading}
                    className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    {isDownloading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Mengunduh...
                        </>
                    ) : (
                        <>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                        </>
                    )}
                </button>
            )}
            
            <Link
                to="/surat-pengantar/create"
                className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            >
                <FileText className="h-4 w-4 mr-2" />
                Buat Pengajuan Baru
            </Link>
        </div>
    </div>
));

// Timeline Component
const Timeline = React.memo(({ timelineSteps }) => {
    const formatDate = useCallback((dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                📅 Timeline Proses
            </h3>
            
            <div className="space-y-4">
                {timelineSteps.map((step, index) => (
                    <div key={index} className="flex items-start">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            step.status === 'completed' ? 'bg-green-100 text-green-600' :
                            step.status === 'rejected' ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-400'
                        }`}>
                            {step.status === 'completed' ? (
                                <CheckCircle className="h-4 w-4" />
                            ) : step.status === 'rejected' ? (
                                <XCircle className="h-4 w-4" />
                            ) : (
                                <Clock className="h-4 w-4" />
                            )}
                        </div>
                        <div className="ml-3 flex-1">
                            <h4 className={`text-sm font-medium ${
                                step.status === 'completed' ? 'text-green-900' :
                                step.status === 'rejected' ? 'text-red-900' :
                                'text-gray-900'
                            }`}>
                                {step.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                            {step.date && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatDate(step.date)}
                                </p>
                            )}
                            {step.approver && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Disetujui oleh: {step.approver}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

// Document Info Sidebar Component
const DocumentInfoSidebar = React.memo(({ detail }) => {
    const formatDate = useCallback((dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    const getStatusBadge = useCallback((status) => {
        if (StatusBadge) {
            return <StatusBadge status={status} size="sm" />;
        }
        
        const config = STATUS_CONFIG[status] || STATUS_CONFIG['DRAFT'];
        const Icon = config.icon;
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
                <Icon className="h-3 w-3 mr-1" />
                {config.text}
            </span>
        );
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📋 Info Dokumen
            </h3>
            
            <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500">Tanggal Pengajuan:</span>
                    <span className="text-gray-900">{formatDate(detail.submitted_at)}</span>
                </div>
                
                {detail.completed_at && (
                    <div className="flex justify-between">
                        <span className="text-gray-500">Tanggal Selesai:</span>
                        <span className="text-gray-900">{formatDate(detail.completed_at)}</span>
                    </div>
                )}
                
                <div className="flex justify-between">
                    <span className="text-gray-500">No. KK:</span>
                    <span className="text-gray-900 font-mono">{detail.kk_no}</span>
                </div>
                
                <div className="flex justify-between items-center">
                    <span className="text-gray-500">Status:</span>
                    {getStatusBadge(detail.status)}
                </div>
            </div>

            {detail.status === 'COMPLETED' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-xs text-gray-500">
                        <QrCode className="h-3 w-3 mr-1" />
                        PDF akan dilengkapi dengan QR Code untuk verifikasi
                    </div>
                </div>
            )}
        </div>
    );
});

// Error State Component
const ErrorState = React.memo(({ error, onRetry }) => (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
                <XCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Gagal Memuat Data
                </h3>
                <p className="text-gray-500 mb-6">
                    {error?.message || 'Terjadi kesalahan saat memuat detail surat pengantar'}
                </p>
                <div className="space-x-4">
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                        Coba Lagi
                    </button>
                    <Link
                        to="/surat-pengantar"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali ke Daftar
                    </Link>
                </div>
            </div>
        </div>
    </div>
));

// Not Found State Component
const NotFoundState = React.memo(() => (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Surat Pengantar Tidak Ditemukan
                </h3>
                <p className="text-gray-500 mb-6">
                    Data surat pengantar yang Anda cari tidak ditemukan
                </p>
                <Link
                    to="/surat-pengantar"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali ke Daftar
                </Link>
            </div>
        </div>
    </div>
));

// Main Component
const SuratPengantarDetail = () => {
    const { id } = useParams();
    const { useDetailQuery, downloadPDF } = useSuratPengantar();
    const [isDownloading, setIsDownloading] = useState(false);

    // Enhanced data parsing with multiple structure support
    const detailQuery = useDetailQuery(id);
    
    // Debug logging
    useEffect(() => {
        console.log('Detail Query State:', {
            data: detailQuery.data,
            isLoading: detailQuery.isLoading,
            error: detailQuery.error,
            id: id
        });
    }, [detailQuery.data, detailQuery.isLoading, detailQuery.error, id]);

    // Memoized data parsing with robust structure handling
    const detail = useMemo(() => {
        if (!detailQuery.data) return null;
        
        const response = detailQuery.data;
        console.log('Raw detail response:', response);
        
        // Handle multiple possible response structures
        if (response.success && response.data) {
            // Structure: { success: true, data: { suratPengantar: {...} } }
            if (response.data.suratPengantar) {
                return response.data.suratPengantar;
            }
            // Structure: { success: true, data: {...} } direct object
            if (response.data.id) {
                return response.data;
            }
            // Structure: { success: true, data: { data: {...} } } nested
            if (response.data.data && response.data.data.id) {
                return response.data.data;
            }
        }
        
        // Direct object structure
        if (response.id) {
            return response;
        }
        
        console.warn('Unexpected response structure:', response);
        return null;
    }, [detailQuery.data]);

    // Memoized timeline steps generation
    const timelineSteps = useMemo(() => {
        if (!detail) return [];

        return [
            {
                title: 'Pengajuan Dibuat',
                status: 'completed',
                date: detail.submitted_at,
                description: 'Pengajuan surat pengantar telah dibuat'
            },
            {
                title: 'Persetujuan RT',
                status: detail.rt_approved_at ? 'completed' : detail.status === 'REJECTED' ? 'rejected' : 'pending',
                date: detail.rt_approved_at,
                description: detail.rt_notes || 'Menunggu persetujuan dari RT',
                approver: detail.rt_approver_name
            },
            {
                title: 'Persetujuan RW',
                status: detail.rw_approved_at ? 'completed' : detail.status === 'REJECTED' && detail.rt_approved_at ? 'rejected' : 'pending',
                date: detail.rw_approved_at,
                description: detail.rw_notes || 'Menunggu persetujuan dari RW',
                approver: detail.rw_approver_name
            },
            {
                title: 'Selesai',
                status: detail.completed_at ? 'completed' : 'pending',
                date: detail.completed_at,
                description: detail.completed_at ? 'Surat pengantar siap diunduh' : 'Menunggu persetujuan lengkap'
            }
        ];
    }, [detail]);

    // Download handler with proper error handling
    const handleDownload = useCallback(async () => {
        if (!id || isDownloading) return;
        
        try {
            setIsDownloading(true);
            await downloadPDF(id);
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
        }
    }, [id, isDownloading, downloadPDF]);

    // Status badge helper with fallback
    const getStatusBadge = useCallback((status) => {
        if (StatusBadge) {
            return <StatusBadge status={status} size="md" />;
        }
        
        const config = STATUS_CONFIG[status] || STATUS_CONFIG['DRAFT'];
        const Icon = config.icon;
        
        return (
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${config.color}`}>
                <Icon className="h-4 w-4 mr-2" />
                {config.text}
            </span>
        );
    }, []);

    // Loading state
    if (detailQuery.isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <LoadingSpinner text="Memuat detail surat pengantar..." />
                </div>
            </div>
        );
    }

    // Error state
    if (detailQuery.error) {
        return (
            <ErrorState 
                error={detailQuery.error} 
                onRetry={() => detailQuery.refetch()} 
            />
        );
    }

    // Not found state
    if (!detail) {
        return <NotFoundState />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <Link
                            to="/surat-pengantar"
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Kembali ke Daftar Surat
                        </Link>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="h-12 w-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                                        <FileText className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-white mb-2">
                                            {detail.category_name}
                                        </h1>
                                        <p className="text-indigo-100">
                                            ID: {detail.id}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {getStatusBadge(detail.status)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <DocumentInfo detail={detail} />
                        <ApplicantInfo detail={detail} />
                        <ApprovalNotes detail={detail} />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <QuickActions 
                            detail={detail} 
                            onDownload={handleDownload} 
                            isDownloading={isDownloading} 
                        />
                        <Timeline timelineSteps={timelineSteps} />
                        <DocumentInfoSidebar detail={detail} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Set display names for debugging
DocumentInfo.displayName = 'DocumentInfo';
ApplicantInfo.displayName = 'ApplicantInfo';
ApprovalNotes.displayName = 'ApprovalNotes';
QuickActions.displayName = 'QuickActions';
Timeline.displayName = 'Timeline';
DocumentInfoSidebar.displayName = 'DocumentInfoSidebar';
ErrorState.displayName = 'ErrorState';
NotFoundState.displayName = 'NotFoundState';

export default SuratPengantarDetail;