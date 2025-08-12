import { useState, useEffect } from 'react';
import { 
    FileText, 
    Clock, 
    CheckCircle, 
    XCircle, 
    Users, 
    Calendar,
    AlertTriangle,
    User,
    BarChart3,
    TrendingUp,
    Home,
    MapPin,
    Settings,
    Download,
    Search,
    Filter,
    RefreshCw,
    Eye,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useSuratPengantar } from '../../hooks/useSuratPengantar';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

// Service function untuk admin statistics
const fetchAdminStatistics = async (params = {}) => {
    const response = await api.get('/api/surat-pengantar/admin/statistics', { params });
    return response.data;
};

// Service function untuk admin requests
const fetchAdminRequests = async (params = {}) => {
    const response = await api.get('/api/surat-pengantar/admin/requests', { params });
    return response.data;
};

// Service function untuk locations
const fetchLocations = async () => {
    const [rwResponse, rtResponse] = await Promise.all([
        api.get('/api/locations/rw'),
        api.get('/api/locations/rt')
    ]);
    
    return {
        rw: rwResponse.data?.rw || [],
        rt: rtResponse.data?.rt || []
    };
};

const AdminSuratPengantarDashboard = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [selectedRW, setSelectedRW] = useState('');
    const [selectedRT, setSelectedRT] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    
    // Fetch statistics with React Query
    const { 
        data: statistics = {}, 
        isLoading: statisticsLoading,
        refetch: refetchStatistics 
    } = useQuery({
        queryKey: ['admin-statistics', { 
            period: selectedPeriod, 
            rwId: selectedRW || undefined,
            rtId: selectedRT || undefined
        }],
        queryFn: () => fetchAdminStatistics({ 
            period: selectedPeriod,
            rwId: selectedRW || undefined,
            rtId: selectedRT || undefined
        }),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    // Fetch all requests with pagination
    const { 
        data: requestsData = { data: [], pagination: {} }, 
        isLoading: requestsLoading,
        refetch: refetchRequests 
    } = useQuery({
        queryKey: ['admin-requests', { 
            page: currentPage,
            limit: 10,
            status: statusFilter || undefined,
            search: searchTerm || undefined,
            rwId: selectedRW || undefined,
            rtId: selectedRT || undefined
        }],
        queryFn: () => fetchAdminRequests({
            page: currentPage,
            limit: 10,
            status: statusFilter || undefined,
            search: searchTerm || undefined,
            rwId: selectedRW || undefined,
            rtId: selectedRT || undefined
        }),
        keepPreviousData: true,
        staleTime: 30 * 1000, // 30 seconds
    });

    // Fetch locations for filters
    const { 
        data: locations = { rw: [], rt: [] },
        isLoading: locationsLoading 
    } = useQuery({
        queryKey: ['admin-locations'],
        queryFn: fetchLocations,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'SUBMITTED': { color: 'bg-blue-100 text-blue-800', text: 'Menunggu RT', icon: Clock },
            'RT_APPROVED': { color: 'bg-yellow-100 text-yellow-800', text: 'Menunggu RW', icon: AlertTriangle },
            'COMPLETED': { color: 'bg-green-100 text-green-800', text: 'Selesai', icon: CheckCircle },
            'REJECTED': { color: 'bg-red-100 text-red-800', text: 'Ditolak', icon: XCircle }
        };
        
        const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status, icon: Clock };
        const Icon = config.icon;
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="h-3 w-3 mr-1" />
                {config.text}
            </span>
        );
    };

    const handleExportData = () => {
        const params = new URLSearchParams({
            period: selectedPeriod,
            ...(selectedRW && { rwId: selectedRW }),
            ...(selectedRT && { rtId: selectedRT }),
            ...(statusFilter && { status: statusFilter }),
            format: 'excel'
        });
        
        window.open(`/api/surat-pengantar/admin/export?${params.toString()}`, '_blank');
    };

    const handleViewDetail = (request) => {
        setSelectedRequest(request);
        setShowDetailModal(true);
    };

    const filteredRTList = selectedRW 
        ? locations.rt.filter(rt => rt.rw_id === parseInt(selectedRW))
        : locations.rt;

    // Reset RT when RW changes
    useEffect(() => {
        if (selectedRW) {
            setSelectedRT('');
        }
    }, [selectedRW]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedPeriod, selectedRW, selectedRT, statusFilter, searchTerm]);

    const handleRefresh = () => {
        refetchStatistics();
        refetchRequests();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-2">
                                    Dashboard Admin - Surat Pengantar
                                </h1>
                                <p className="text-indigo-100">
                                    Monitoring dan analisis sistem surat pengantar secara menyeluruh
                                </p>
                            </div>
                            <div className="hidden sm:block">
                                <div className="h-16 w-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                                    <Settings className="h-8 w-8 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-200"
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    {showAdvancedFilters ? 'Sembunyikan' : 'Tampilkan'} Filter
                                </button>
                                
                                <button
                                    onClick={handleExportData}
                                    className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Data
                                </button>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleRefresh}
                                    className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                                    disabled={statisticsLoading || requestsLoading}
                                >
                                    <RefreshCw className={`h-4 w-4 mr-1 ${(statisticsLoading || requestsLoading) ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Filters */}
                {showAdvancedFilters && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            🔍 Filter Lanjutan
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Period Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Periode
                                </label>
                                <select
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="week">Minggu Ini</option>
                                    <option value="month">Bulan Ini</option>
                                    <option value="quarter">Kuartal Ini</option>
                                    <option value="year">Tahun Ini</option>
                                </select>
                            </div>

                            {/* RW Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    RW
                                </label>
                                <select
                                    value={selectedRW}
                                    onChange={(e) => setSelectedRW(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    disabled={locationsLoading}
                                >
                                    <option value="">Semua RW</option>
                                    {locations.rw.map((rw) => (
                                        <option key={rw.id} value={rw.id}>
                                            RW {rw.no?.toString().padStart(3, '0')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* RT Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    RT
                                </label>
                                <select
                                    value={selectedRT}
                                    onChange={(e) => setSelectedRT(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    disabled={!selectedRW || locationsLoading}
                                >
                                    <option value="">
                                        {selectedRW ? 'Semua RT dalam RW' : 'Pilih RW dulu'}
                                    </option>
                                    {filteredRTList.map((rt) => (
                                        <option key={rt.id} value={rt.id}>
                                            RT {rt.no?.toString().padStart(3, '0')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="SUBMITTED">Menunggu RT</option>
                                    <option value="RT_APPROVED">Menunggu RW</option>
                                    <option value="COMPLETED">Selesai</option>
                                    <option value="REJECTED">Ditolak</option>
                                </select>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pencarian
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Cari berdasarkan nama, NIK, atau kategori surat..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Statistics Cards */}
                {statisticsLoading ? (
                    <div className="mb-8">
                        <LoadingSpinner text="Memuat statistik..." />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[
                            {
                                title: 'Total Pengajuan',
                                value: statistics.total || 0,
                                change: '+12%',
                                changeType: 'increase',
                                icon: FileText,
                                color: 'indigo'
                            },
                            {
                                title: 'Menunggu Approval',
                                value: (statistics.byStatus?.SUBMITTED || 0) + (statistics.byStatus?.RT_APPROVED || 0),
                                change: '-5%',
                                changeType: 'decrease',
                                icon: Clock,
                                color: 'orange'
                            },
                            {
                                title: 'Selesai',
                                value: statistics.byStatus?.COMPLETED || 0,
                                change: '+18%',
                                changeType: 'increase',
                                icon: CheckCircle,
                                color: 'green'
                            },
                            {
                                title: 'Rata-rata Proses',
                                value: statistics.avgProcessingTime ? `${statistics.avgProcessingTime} hari` : '-',
                                change: '-2 hari',
                                changeType: 'decrease',
                                icon: TrendingUp,
                                color: 'blue'
                            }
                        ].map((stat, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`h-12 w-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                                        <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center">
                                    <span className={`text-sm font-medium ${
                                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {stat.change}
                                    </span>
                                    <span className="text-sm text-gray-500 ml-1">dari periode sebelumnya</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Charts and Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Status Distribution */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            📊 Distribusi Status
                        </h3>
                        
                        <div className="space-y-4">
                            {Object.entries(statistics.byStatus || {}).map(([status, count]) => {
                                const total = statistics.total || 1;
                                const percentage = Math.round((count / total) * 100);
                                
                                return (
                                    <div key={status} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            {getStatusBadge(status)}
                                            <span className="ml-3 text-sm font-medium text-gray-900">
                                                {count} pengajuan
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                                                <div 
                                                    className="bg-indigo-600 h-2 rounded-full" 
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-gray-500">{percentage}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Category Distribution */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            📋 Kategori Populer
                        </h3>
                        
                        <div className="space-y-4">
                            {Object.entries(statistics.byCategory || {}).map(([category, count], index) => {
                                const total = statistics.total || 1;
                                const percentage = Math.round((count / total) * 100);
                                
                                return (
                                    <div key={category} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className={`h-3 w-3 rounded-full mr-3 ${
                                                index === 0 ? 'bg-blue-500' :
                                                index === 1 ? 'bg-green-500' :
                                                index === 2 ? 'bg-yellow-500' :
                                                'bg-gray-400'
                                            }`}></div>
                                            <span className="text-sm font-medium text-gray-900 truncate">
                                                {category}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-sm text-gray-600 mr-2">{count}</span>
                                            <span className="text-xs text-gray-500">({percentage}%)</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Recent Requests Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            📄 Semua Pengajuan Surat Pengantar
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Monitor semua pengajuan surat pengantar dalam sistem
                        </p>
                    </div>

                    {requestsLoading ? (
                        <div className="p-8">
                            <LoadingSpinner text="Memuat data pengajuan..." />
                        </div>
                    ) : requestsData.data?.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Tidak Ada Data
                            </h3>
                            <p className="text-gray-500">
                                Tidak ada pengajuan yang sesuai dengan filter yang dipilih
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pengajuan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pemohon
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Lokasi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tanggal
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {requestsData.data?.map((request) => (
                                        <tr key={request.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                                        <FileText className="h-5 w-5 text-indigo-600" />
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
                                            <td className="px-6 py-4">
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
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    RT {request.rt_no?.toString().padStart(2, '0')} / 
                                                    RW {request.rw_no?.toString().padStart(2, '0')}
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
                                                <button
                                                    onClick={() => handleViewDetail(request)}
                                                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {requestsData.pagination && requestsData.pagination.totalPages > 1 && (
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
                                        onClick={() => setCurrentPage(Math.min(requestsData.pagination.totalPages, currentPage + 1))}
                                        disabled={currentPage === requestsData.pagination.totalPages}
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
                                                {Math.min(currentPage * 10, requestsData.pagination.total)}
                                            </span>{' '}
                                            dari{' '}
                                            <span className="font-medium">{requestsData.pagination.total}</span>{' '}
                                            hasil
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            <button
                                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">Sebelumnya</span>
                                                <ChevronLeft className="h-5 w-5" />
                                            </button>
                                            
                                            {Array.from({ length: Math.min(5, requestsData.pagination.totalPages) }, (_, i) => {
                                                const pageNum = i + 1;
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                            currentPage === pageNum
                                                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}

                                            <button
                                                onClick={() => setCurrentPage(Math.min(requestsData.pagination.totalPages, currentPage + 1))}
                                                disabled={currentPage === requestsData.pagination.totalPages}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">Selanjutnya</span>
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Detail Modal */}
                {showDetailModal && selectedRequest && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Detail Surat Pengantar
                                    </h3>
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <XCircle className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left Column - Request Info */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">📋 Informasi Pengajuan</h4>
                                        
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-500">Status</span>
                                                    {getStatusBadge(selectedRequest.status)}
                                                </div>
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {selectedRequest.category_name}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    ID: {selectedRequest.id}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                                        Tanggal Pengajuan
                                                    </label>
                                                    <p className="text-sm text-gray-900">
                                                        {formatDate(selectedRequest.submitted_at)}
                                                    </p>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                                        Lokasi
                                                    </label>
                                                    <p className="text-sm text-gray-900">
                                                        RT {selectedRequest.rt_no?.toString().padStart(2, '0')} / 
                                                        RW {selectedRequest.rw_no?.toString().padStart(2, '0')}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    Alasan Pengajuan
                                                </label>
                                                <div className="bg-blue-50 rounded-lg p-3">
                                                    <p className="text-sm text-gray-800">
                                                        {selectedRequest.reason}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Person Info */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">👤 Data Pemohon</h4>
                                        
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center mb-3">
                                                    <User className="h-5 w-5 text-gray-400 mr-2" />
                                                    <span className="font-medium text-gray-900">
                                                        {selectedRequest.full_name}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    NIK: {selectedRequest.nik}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                                        Tempat, Tanggal Lahir
                                                    </label>
                                                    <p className="text-sm text-gray-900">
                                                        {selectedRequest.pob}, {formatDate(selectedRequest.dob)}
                                                    </p>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                                        Jenis Kelamin
                                                    </label>
                                                    <p className="text-sm text-gray-900">
                                                        {selectedRequest.sex === 'L' ? 'Laki-laki' : 'Perempuan'}
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                                        Pekerjaan
                                                    </label>
                                                    <p className="text-sm text-gray-900">
                                                        {selectedRequest.occupation}
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                                        Alamat
                                                    </label>
                                                    <p className="text-sm text-gray-900">
                                                        {selectedRequest.address}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Approval Timeline */}
                                <div className="mt-8 border-t border-gray-200 pt-6">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">📅 Timeline Persetujuan</h4>
                                    
                                    <div className="space-y-4">
                                        {/* Submitted */}
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                                <CheckCircle className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    Pengajuan Dibuat
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDate(selectedRequest.submitted_at)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* RT Approval */}
                                        <div className="flex items-center">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-4 ${
                                                selectedRequest.rt_approved_at ? 'bg-green-100' : 
                                                selectedRequest.status === 'REJECTED' ? 'bg-red-100' : 'bg-gray-100'
                                            }`}>
                                                {selectedRequest.rt_approved_at ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : selectedRequest.status === 'REJECTED' ? (
                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                ) : (
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    Persetujuan RT
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {selectedRequest.rt_approved_at ? 
                                                        formatDate(selectedRequest.rt_approved_at) : 
                                                        'Menunggu persetujuan RT'
                                                    }
                                                </p>
                                                {selectedRequest.rt_approver_name && (
                                                    <p className="text-xs text-gray-400">
                                                        oleh: {selectedRequest.rt_approver_name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* RW Approval */}
                                        <div className="flex items-center">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-4 ${
                                                selectedRequest.rw_approved_at ? 'bg-green-100' : 
                                                selectedRequest.status === 'REJECTED' && selectedRequest.rt_approved_at ? 'bg-red-100' : 'bg-gray-100'
                                            }`}>
                                                {selectedRequest.rw_approved_at ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : selectedRequest.status === 'REJECTED' && selectedRequest.rt_approved_at ? (
                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                ) : (
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    Persetujuan RW
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {selectedRequest.rw_approved_at ? 
                                                        formatDate(selectedRequest.rw_approved_at) : 
                                                        'Menunggu persetujuan RW'
                                                    }
                                                </p>
                                                {selectedRequest.rw_approver_name && (
                                                    <p className="text-xs text-gray-400">
                                                        oleh: {selectedRequest.rw_approver_name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Completed */}
                                        <div className="flex items-center">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-4 ${
                                                selectedRequest.completed_at ? 'bg-green-100' : 'bg-gray-100'
                                            }`}>
                                                {selectedRequest.completed_at ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    Selesai
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {selectedRequest.completed_at ? 
                                                        formatDate(selectedRequest.completed_at) : 
                                                        'Menunggu persetujuan lengkap'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {(selectedRequest.rt_notes || selectedRequest.rw_notes) && (
                                    <div className="mt-6 border-t border-gray-200 pt-6">
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">💬 Catatan</h4>
                                        
                                        {selectedRequest.rt_notes && (
                                            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-sm font-medium text-blue-900 mb-1">Catatan RT:</p>
                                                <p className="text-sm text-blue-800">{selectedRequest.rt_notes}</p>
                                            </div>
                                        )}
                                        
                                        {selectedRequest.rw_notes && (
                                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                                <p className="text-sm font-medium text-green-900 mb-1">Catatan RW:</p>
                                                <p className="text-sm text-green-800">{selectedRequest.rw_notes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSuratPengantarDashboard;