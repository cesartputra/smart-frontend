// src/pages/suratPengantar/SuratPengantarList.jsx - FIXED VERSION
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    User,
    RefreshCw,
    SlidersHorizontal
} from 'lucide-react';
import { useSuratPengantar } from '../../hooks/useSuratPengantar';
import { StatCard, DataTable, StatusBadge } from '../../components/suratPengantar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SuratPengantarList = () => {
    // State management dengan default values yang sesuai backend validation
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortBy, setSortBy] = useState('submitted_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [limit, setLimit] = useState(10);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    
    const { 
        useMyRequests,
        categories,
        categoriesLoading,
        fetchCategories,
        downloadPDF,
        validateStatus,
        validatePagination
    } = useSuratPengantar();

    // Memoized query parameters dengan validation
    const queryParams = useMemo(() => {
        const validated = validatePagination ? validatePagination(currentPage, limit) : { page: currentPage, limit };
        const params = {
            page: validated.page,
            limit: validated.limit
        };

        // Add filters only if they have valid values
        if (statusFilter && validateStatus && validateStatus(statusFilter)) {
            params.status = statusFilter;
        }

        if (searchTerm && searchTerm.trim().length >= 2) {
            params.search = searchTerm.trim();
        }

        if (categoryFilter) {
            const categoryId = parseInt(categoryFilter);
            if (!isNaN(categoryId)) {
                params.categoryId = categoryId;
            }
        }

        if (sortBy) {
            params.sortBy = sortBy;
        }

        if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
            params.sortOrder = sortOrder;
        }

        return params;
    }, [currentPage, limit, statusFilter, searchTerm, categoryFilter, sortBy, sortOrder, validateStatus, validatePagination]);

    // Use the refactored hook - dengan fallback jika hook tidak tersedia
    const myRequestsQuery = useMyRequests ? useMyRequests(queryParams) : { 
        data: null, 
        isLoading: false, 
        isFetching: false, 
        refetch: () => {} 
    };

    // Fetch categories on mount
    useEffect(() => {
        if (categories && categories.length === 0 && !categoriesLoading && fetchCategories) {
            fetchCategories();
        }
    }, [categories, categoriesLoading, fetchCategories]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, searchTerm, categoryFilter, sortBy, sortOrder]);

    // FIXED: Memoized data dengan proper array validation
    const requestsData = useMemo(() => {
        console.log('Raw myRequestsQuery.data:', myRequestsQuery.data); // Debug log
        
        if (!myRequestsQuery.data) {
            return { data: [], pagination: { total: 0, totalPages: 0 } };
        }

        const response = myRequestsQuery.data;
        let extractedData = [];
        let extractedPagination = { total: 0, totalPages: 0 };
        
        // Handle different response structures
        if (response.success && response.data) {
            // Structure: { success: true, data: { requests: [...], pagination: {...} } }
            extractedData = response.data.requests || response.data;
            extractedPagination = response.data.pagination || response.pagination || {};
        } else if (response.data && response.pagination) {
            // Structure: { data: [...], pagination: {...} }
            extractedData = response.data;
            extractedPagination = response.pagination;
        } else if (Array.isArray(response)) {
            // Direct array response
            extractedData = response;
            extractedPagination = { total: response.length, totalPages: 1 };
        } else if (Array.isArray(response.data)) {
            // Structure: { data: [...] }
            extractedData = response.data;
            extractedPagination = response.pagination || { total: response.data.length, totalPages: 1 };
        }

        // SAFETY CHECK: Ensure data is always an array
        if (!Array.isArray(extractedData)) {
            console.warn('Data is not an array:', extractedData);
            extractedData = [];
        }

        console.log('Processed data:', { data: extractedData, pagination: extractedPagination }); // Debug log

        return { 
            data: extractedData, 
            pagination: extractedPagination 
        };
    }, [myRequestsQuery.data]);

    // Status configuration untuk badge
    const getStatusBadge = useCallback((status) => {
        if (StatusBadge) {
            return <StatusBadge status={status} size="sm" />;
        }
        
        // Fallback jika StatusBadge tidak tersedia
        const statusConfig = {
            'DRAFT': { color: 'bg-gray-100 text-gray-800', text: 'Draft' },
            'SUBMITTED': { color: 'bg-blue-100 text-blue-800', text: 'Diajukan' },
            'RT_APPROVED': { color: 'bg-yellow-100 text-yellow-800', text: 'Menunggu RW' },
            'COMPLETED': { color: 'bg-green-100 text-green-800', text: 'Selesai' },
            'REJECTED': { color: 'bg-red-100 text-red-800', text: 'Ditolak' }
        };
        
        const config = statusConfig[status] || statusConfig['DRAFT'];
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    }, []);

    // Format date helper
    const formatDate = useCallback((dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return '-';
        }
    }, []);

    // Handle download with proper error handling
    const handleDownload = useCallback(async (id) => {
        if (!downloadPDF) {
            console.error('downloadPDF function not available');
            return;
        }
        
        try {
            await downloadPDF(id);
        } catch (error) {
            console.error('Download error:', error);
        }
    }, [downloadPDF]);

    // FIXED: Memoized stats dengan proper array validation
    const stats = useMemo(() => {
        const data = requestsData.data;
        
        // SAFETY CHECK: Ensure data is array before using filter
        const safeData = Array.isArray(data) ? data : [];
        
        return [
            { 
                label: 'Total Pengajuan', 
                value: requestsData.pagination?.total || safeData.length, 
                color: 'blue',
                icon: FileText
            },
            { 
                label: 'Dalam Proses', 
                value: safeData.filter(r => ['SUBMITTED', 'RT_APPROVED'].includes(r?.status)).length, 
                color: 'yellow',
                icon: Clock
            },
            { 
                label: 'Selesai', 
                value: safeData.filter(r => r?.status === 'COMPLETED').length, 
                color: 'green',
                icon: CheckCircle
            },
            { 
                label: 'Ditolak', 
                value: safeData.filter(r => r?.status === 'REJECTED').length, 
                color: 'red',
                icon: XCircle
            }
        ];
    }, [requestsData]);

    // Table columns definition
    const tableColumns = useMemo(() => [
        {
            key: 'category',
            title: 'Kategori Surat',
            width: '25%',
            render: (request) => (
                <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {request?.category_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                            ID: {request?.id ? request.id.substring(0, 8) + '...' : 'N/A'}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'requester',
            title: 'Pemohon',
            width: '20%',
            render: (request) => (
                <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {request?.full_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                            NIK: {request?.nik ? 
                                request.nik.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-****-****-$4') : 
                                'N/A'
                            }
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            title: 'Status',
            width: '15%',
            render: (request) => getStatusBadge(request?.status || 'DRAFT')
        },
        {
            key: 'date',
            title: 'Tanggal Pengajuan',
            width: '20%',
            render: (request) => (
                <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(request?.submitted_at)}
                </div>
            )
        },
        {
            key: 'actions',
            title: 'Aksi',
            width: '20%',
            render: (request) => (
                <div className="flex space-x-2">
                    <Link
                        to={`/surat-pengantar/${request?.id || ''}`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                    </Link>
                    
                    {request?.status === 'COMPLETED' && (
                        <button
                            onClick={() => handleDownload(request.id)}
                            className="inline-flex items-center px-3 py-1 border border-green-300 rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                        >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                        </button>
                    )}
                </div>
            )
        }
    ], [getStatusBadge, formatDate, handleDownload]);

    // Event handlers
    const handleRefresh = useCallback(() => {
        if (myRequestsQuery.refetch) {
            myRequestsQuery.refetch();
        }
    }, [myRequestsQuery]);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const handleSearch = useCallback((value) => {
        setSearchTerm(value);
    }, []);

    const handleStatusFilter = useCallback((status) => {
        setStatusFilter(status);
    }, []);

    const handleCategoryFilter = useCallback((categoryId) => {
        setCategoryFilter(categoryId);
    }, []);

    const handleSortChange = useCallback((field, order) => {
        setSortBy(field);
        setSortOrder(order);
    }, []);

    const clearFilters = useCallback(() => {
        setStatusFilter('');
        setSearchTerm('');
        setCategoryFilter('');
        setSortBy('submitted_at');
        setSortOrder('desc');
        setCurrentPage(1);
    }, []);

    // SAFETY CHECK: Ensure categories is always an array
    const safeCategories = Array.isArray(categories) ? categories : [];

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
                            {stats.map((stat, index) => (
                                StatCard ? (
                                    <StatCard
                                        key={index}
                                        title={stat.label}
                                        value={stat.value}
                                        icon={stat.icon}
                                        color={stat.color}
                                        loading={myRequestsQuery.isLoading}
                                    />
                                ) : (
                                    // Fallback StatCard jika komponen tidak tersedia
                                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
                                            <stat.icon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="p-6">
                        <div className="flex flex-col gap-4">
                            {/* Top Row - Search and Primary Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            type="text"
                                            placeholder="Cari berdasarkan kategori atau nama..."
                                            value={searchTerm}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
                                        />
                                    </div>

                                    {/* Quick Filters */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                            className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                        >
                                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                                            Filter
                                        </button>
                                        
                                        <button
                                            onClick={handleRefresh}
                                            disabled={myRequestsQuery.isFetching}
                                            className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
                                        >
                                            <RefreshCw className={`h-4 w-4 mr-2 ${myRequestsQuery.isFetching ? 'animate-spin' : ''}`} />
                                            Refresh
                                        </button>
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

                            {/* Advanced Filters */}
                            {showAdvancedFilters && (
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Status Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Status
                                            </label>
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => handleStatusFilter(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Semua Status</option>
                                                <option value="DRAFT">Draft</option>
                                                <option value="SUBMITTED">Diajukan</option>
                                                <option value="RT_APPROVED">Menunggu RW</option>
                                                <option value="COMPLETED">Selesai</option>
                                                <option value="REJECTED">Ditolak</option>
                                            </select>
                                        </div>

                                        {/* Category Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Kategori
                                            </label>
                                            <select
                                                value={categoryFilter}
                                                onChange={(e) => handleCategoryFilter(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                disabled={categoriesLoading}
                                            >
                                                <option value="">Semua Kategori</option>
                                                {safeCategories.map((category) => (
                                                    <option key={category?.id || Math.random()} value={category?.id || ''}>
                                                        {category?.name || 'N/A'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Sort Options */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Urutkan
                                            </label>
                                            <select
                                                value={`${sortBy}-${sortOrder}`}
                                                onChange={(e) => {
                                                    const [field, order] = e.target.value.split('-');
                                                    handleSortChange(field, order);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="submitted_at-desc">Terbaru</option>
                                                <option value="submitted_at-asc">Terlama</option>
                                                <option value="category_name-asc">Kategori A-Z</option>
                                                <option value="category_name-desc">Kategori Z-A</option>
                                                <option value="status-asc">Status A-Z</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Clear Filters */}
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={clearFilters}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                                        >
                                            Reset Filter
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Requests Table */}
                {DataTable ? (
                    <DataTable
                        columns={tableColumns}
                        data={requestsData.data}
                        loading={myRequestsQuery.isLoading}
                        pagination={{
                            currentPage,
                            totalPages: requestsData.pagination?.totalPages || 1,
                            total: requestsData.pagination?.total || 0,
                            limit
                        }}
                        onPageChange={handlePageChange}
                        emptyMessage="Belum Ada Pengajuan"
                        emptyDescription="Anda belum memiliki pengajuan surat pengantar. Klik tombol 'Buat Pengajuan Baru' untuk memulai."
                        emptyIcon={FileText}
                    />
                ) : (
                    // Fallback table jika DataTable tidak tersedia
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {requestsData.data.length === 0 ? (
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
                                        {requestsData.data.map((request, index) => (
                                            <tr key={request?.id || index} className="hover:bg-gray-50">
                                                {tableColumns.map((column, colIndex) => (
                                                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                                                        {column.render ? column.render(request) : request[column.key] || '-'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

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