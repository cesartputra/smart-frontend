// src/pages/suratPengantar/AdminSuratPengantarDashboard.jsx
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
    RefreshCw
} from 'lucide-react';
import { useSuratPengantar } from '../../hooks/useSuratPengantar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminSuratPengantarDashboard = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [selectedRW, setSelectedRW] = useState('');
    const [selectedRT, setSelectedRT] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    
    const { 
        statistics,
        statisticsLoading,
        fetchStatistics,
        myRequests,
        myRequestsLoading,
        fetchMyRequests
    } = useSuratPengantar();

    // Mock data for RW/RT selection (replace with actual API call)
    const [rwList] = useState([
        { id: 1, name: 'RW 001' },
        { id: 2, name: 'RW 002' },
        { id: 3, name: 'RW 003' },
    ]);

    const [rtList] = useState([
        { id: 1, name: 'RT 001', rw_id: 1 },
        { id: 2, name: 'RT 002', rw_id: 1 },
        { id: 3, name: 'RT 003', rw_id: 2 },
    ]);

    useEffect(() => {
        fetchStatistics({ 
            period: selectedPeriod,
            rwId: selectedRW || undefined,
            rtId: selectedRT || undefined
        });
    }, [selectedPeriod, selectedRW, selectedRT, fetchStatistics]);

    useEffect(() => {
        fetchMyRequests({
            page: currentPage,
            limit: 10,
            status: statusFilter || undefined,
            search: searchTerm || undefined
        });
    }, [currentPage, statusFilter, searchTerm, fetchMyRequests]);

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
            'SUBMITTED': { color: 'bg-blue-100 text-blue-800', text: 'Menunggu RT' },
            'RT_APPROVED': { color: 'bg-yellow-100 text-yellow-800', text: 'Menunggu RW' },
            'COMPLETED': { color: 'bg-green-100 text-green-800', text: 'Selesai' },
            'REJECTED': { color: 'bg-red-100 text-red-800', text: 'Ditolak' }
        };
        
        const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const handleExportData = () => {
        // Mock export functionality
        console.log('Exporting data with filters:', {
            period: selectedPeriod,
            rw: selectedRW,
            rt: selectedRT,
            status: statusFilter
        });
        // You would implement actual export logic here
        alert('Export feature akan diimplementasikan');
    };

    const filteredRTList = selectedRW 
        ? rtList.filter(rt => rt.rw_id === parseInt(selectedRW))
        : rtList;

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
                                    onClick={() => {
                                        fetchStatistics({ period: selectedPeriod, rwId: selectedRW, rtId: selectedRT });
                                        fetchMyRequests({ page: currentPage, status: statusFilter, search: searchTerm });
                                    }}
                                    className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                                    disabled={statisticsLoading || myRequestsLoading}
                                >
                                    <RefreshCw className={`h-4 w-4 mr-1 ${(statisticsLoading || myRequestsLoading) ? 'animate-spin' : ''}`} />
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
                                    onChange={(e) => {
                                        setSelectedRW(e.target.value);
                                        setSelectedRT(''); // Reset RT when RW changes
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">Semua RW</option>
                                    {rwList.map((rw) => (
                                        <option key={rw.id} value={rw.id}>
                                            {rw.name}
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
                                    disabled={!selectedRW}
                                >
                                    <option value="">
                                        {selectedRW ? 'Semua RT dalam RW' : 'Pilih RW dulu'}
                                    </option>
                                    {filteredRTList.map((rt) => (
                                        <option key={rt.id} value={rt.id}>
                                            {rt.name}
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
                            📄 Pengajuan Terbaru
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Monitor semua pengajuan surat pengantar dalam sistem
                        </p>
                    </div>

                    {myRequestsLoading ? (
                        <div className="p-8">
                            <LoadingSpinner text="Memuat data pengajuan..." />
                        </div>
                    ) : myRequests.data?.length === 0 ? (
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
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {myRequests.data?.map((request) => (
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
                                            <span className="font-