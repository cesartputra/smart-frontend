// src/pages/suratPengantar/SuratPengantarList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FileText, 
    Plus, 
    Filter, 
    Download, 
    Eye, 
    Clock, 
    CheckCircle, 
    XCircle,
    AlertCircle,
    Search,
    Calendar,
    User
} from 'lucide-react';
import { useSuratPengantar } from '../../hooks/useSuratPengantar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SuratPengantarList = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const { 
        myRequests, 
        myRequestsLoading, 
        fetchMyRequests, 
        downloadPDF, 
        isDownloading 
    } = useSuratPengantar();

    useEffect(() => {
        fetchMyRequests({
            page: currentPage,
            limit: 10,
            status: statusFilter || undefined
        });
    }, [currentPage, statusFilter, fetchMyRequests]);

    const getStatusBadge = (status) => {
        const statusConfig = {
            'DRAFT': {
                color: 'bg-gray-100 text-gray-800',
                icon: Clock,
                text: 'Draft'
            },
            'SUBMITTED': {
                color: 'bg-blue-100 text-blue-800',
                icon: Clock,
                text: 'Diajukan'
            },
            'RT_APPROVED': {
                color: 'bg-yellow-100 text-yellow-800',
                icon: AlertCircle,
                text: 'Menunggu RW'
            },
            'COMPLETED': {
                color: 'bg-green-100 text-green-800',
                icon: CheckCircle,
                text: 'Selesai'
            },
            'REJECTED': {
                color: 'bg-red-100 text-red-800',
                icon: XCircle,
                text: 'Ditolak'
            }
        };

        const config = statusConfig[status] || statusConfig['DRAFT'];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="h-3 w-3 mr-1" />
                {config.text}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleDownload = (id) => {
        downloadPDF(id);
    };

    const filteredRequests = myRequests.data?.filter(request => {
        const matchesSearch = searchTerm === '' || 
            request.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.full_name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    }) || [];

    if (myRequestsLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <LoadingSpinner text="Memuat daftar surat pengantar..." />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-2">
                                    Surat Pengantar
                                </h1>
                                <p className="text-blue-100">
                                    Kelola pengajuan surat pengantar keluarga Anda
                                </p>
                            </div>
                            <div className="hidden sm:block">
                                <div className="h-16 w-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                                    <FileText className="h-8 w-8 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Pengajuan', value: myRequests.pagination?.total || 0, color: 'text-blue-600' },
                                { 
                                    label: 'Dalam Proses', 
                                    value: filteredRequests.filter(r => ['SUBMITTED', 'RT_APPROVED'].includes(r.status)).length, 
                                    color: 'text-yellow-600' 
                                },
                                { 
                                    label: 'Selesai', 
                                    value: filteredRequests.filter(r => r.status === 'COMPLETED').length, 
                                    color: 'text-green-600' 
                                },
                                { 
                                    label: 'Ditolak', 
                                    value: filteredRequests.filter(r => r.status === 'REJECTED').length, 
                                    color: 'text-red-600' 
                                }
                            ].map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className={`text-2xl font-bold ${stat.color}`}>
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-gray-500">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Cari berdasarkan kategori atau nama..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                    >
                                        <option value="">Semua Status</option>
                                        <option value="SUBMITTED">Diajukan</option>
                                        <option value="RT_APPROVED">Menunggu RW</option>
                                        <option value="COMPLETED">Selesai</option>
                                        <option value="REJECTED">Ditolak</option>
                                    </select>
                                </div>
                            </div>

                            {/* Add New Button */}
                            <Link
                                to="/surat-pengantar/create"
                                className="flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Buat Pengajuan Baru
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Requests List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {filteredRequests.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Belum Ada Pengajuan
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Anda belum memiliki pengajuan surat pengantar
                            </p>
                            <Link
                                to="/surat-pengantar/create"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Buat Pengajuan Pertama
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Kategori Surat
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pemohon
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tanggal Pengajuan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                        <FileText className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {request.category_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {request.id.substring(0, 8)}...
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 text-gray-400 mr-2" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {request.full_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            NIK: {request.nik?.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-****-****-$4')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(request.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    {formatDate(request.submitted_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <Link
                                                        to={`/surat-pengantar/${request.id}`}
                                                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Detail
                                                    </Link>
                                                    
                                                    {request.status === 'COMPLETED' && (
                                                        <button
                                                            onClick={() => handleDownload(request.id)}
                                                            disabled={isDownloading}
                                                            className="inline-flex items-center px-3 py-1 border border-green-300 rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                        >
                                                            <Download className="h-4 w-4 mr-1" />
                                                            {isDownloading ? 'Downloading...' : 'Download'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {myRequests.pagination && myRequests.pagination.totalPages > 1 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Sebelumnya
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(Math.min(myRequests.pagination.totalPages, currentPage + 1))}
                                        disabled={currentPage === myRequests.pagination.totalPages}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Selanjutnya
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Menampilkan{' '}
                                            <span className="font-medium">
                                                {((currentPage - 1) * 10) + 1}
                                            </span>{' '}
                                            sampai{' '}
                                            <span className="font-medium">
                                                {Math.min(currentPage * 10, myRequests.pagination.total)}
                                            </span>{' '}
                                            dari{' '}
                                            <span className="font-medium">{myRequests.pagination.total}</span>{' '}
                                            hasil
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            <button
                                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">Sebelumnya</span>
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            
                                            {/* Page numbers */}
                                            {Array.from({ length: Math.min(5, myRequests.pagination.totalPages) }, (_, i) => {
                                                const pageNum = i + 1;
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                            currentPage === pageNum
                                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}

                                            <button
                                                onClick={() => setCurrentPage(Math.min(myRequests.pagination.totalPages, currentPage + 1))}
                                                disabled={currentPage === myRequests.pagination.totalPages}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">Selanjutnya</span>
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Guide */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        📋 Panduan Pengajuan Surat Pengantar
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <div className="flex items-center mb-2">
                                <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                    <span className="text-xs font-medium text-blue-600">1</span>
                                </div>
                                <h4 className="font-medium text-gray-900">Buat Pengajuan</h4>
                            </div>
                            <p className="text-sm text-gray-600 ml-8">
                                Pilih kategori surat dan isi alasan pengajuan dengan jelas
                            </p>
                        </div>
                        <div>
                            <div className="flex items-center mb-2">
                                <div className="h-6 w-6 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                                    <span className="text-xs font-medium text-yellow-600">2</span>
                                </div>
                                <h4 className="font-medium text-gray-900">Menunggu Persetujuan</h4>
                            </div>
                            <p className="text-sm text-gray-600 ml-8">
                                Surat akan diproses oleh RT kemudian RW secara berurutan
                            </p>
                        </div>
                        <div>
                            <div className="flex items-center mb-2">
                                <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                                    <span className="text-xs font-medium text-green-600">3</span>
                                </div>
                                <h4 className="font-medium text-gray-900">Download Surat</h4>
                            </div>
                            <p className="text-sm text-gray-600 ml-8">
                                Setelah disetujui, Anda dapat mengunduh surat dalam format PDF
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuratPengantarList;