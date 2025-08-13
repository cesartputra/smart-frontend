// src/pages/suratPengantar/RWDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Shield, 
    Clock, 
    CheckCircle, 
    XCircle, 
    FileText,
    TrendingUp,
    BarChart3,
    User,
    Calendar,
    Home,
    MessageSquare,
    AlertTriangle
} from 'lucide-react';
import { useSuratPengantar } from '../../hooks/useSuratPengantar';
import { StatCard, DataTable, StatusBadge, ApprovalModal } from '../../components/suratPengantar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RWDashboard = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    
    const { 
        pendingRWRequests,
        pendingRWLoading,
        fetchPendingRW,
        rwApproval,
        isRWProcessing,
        statistics,
        statisticsLoading,
        fetchStatistics
    } = useSuratPengantar();

    // Fetch data saat komponen dimount dan ketika dependencies berubah
    useEffect(() => {
        fetchPendingRW({ page: currentPage, limit: 10 });
        fetchStatistics({ period: selectedPeriod });
    }, [currentPage, selectedPeriod, fetchPendingRW, fetchStatistics]);

    // Memoized data untuk mencegah re-render yang tidak perlu
    const pendingRequests = useMemo(() => 
        pendingRWRequests || { data: [], pagination: {} }, 
        [pendingRWRequests]
    );

    // Memoized stats cards
    const statsCards = useMemo(() => [
        { 
            title: 'Menunggu RW', 
            value: pendingRequests.pagination?.total || 0, 
            icon: Clock,
            color: 'orange',
            trend: 'neutral'
        },
        { 
            title: 'Total Bulan Ini', 
            value: statistics.total || 0, 
            icon: FileText,
            color: 'purple',
            trend: 'up',
            trendValue: '+12%'
        },
        { 
            title: 'Diselesaikan', 
            value: statistics.byStatus?.COMPLETED || 0, 
            icon: CheckCircle,
            color: 'green',
            trend: 'up',
            trendValue: '+18%'
        },
        { 
            title: 'Ditolak RW', 
            value: statistics.byStatus?.REJECTED || 0, 
            icon: XCircle,
            color: 'red',
            trend: 'down',
            trendValue: '-5%'
        },
        { 
            title: 'Rata-rata Proses', 
            value: statistics.avgProcessingTime ? `${statistics.avgProcessingTime} hari` : '-', 
            icon: TrendingUp,
            color: 'blue',
            trend: 'down',
            trendValue: '-2 hari'
        }
    ], [pendingRequests.pagination?.total, statistics]);

    // Function untuk menghasilkan badge prioritas
    const getPriorityBadge = useCallback((rtApprovedAt) => {
        const daysSince = Math.floor((new Date() - new Date(rtApprovedAt)) / (1000 * 60 * 60 * 24));
        
        if (daysSince >= 5) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Sangat Mendesak ({daysSince} hari)
                </span>
            );
        } else if (daysSince >= 3) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Mendesak ({daysSince} hari)
                </span>
            );
        } else if (daysSince >= 1) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    {daysSince} hari
                </span>
            );
        }
        
        return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Clock className="h-3 w-3 mr-1" />
                Baru dari RT
            </span>
        );
    }, []);

    // Optimized columns untuk DataTable
    const tableColumns = useMemo(() => [
        {
            key: 'category',
            title: 'Pengajuan',
            width: '25%',
            render: (request) => (
                <div className="flex items-center">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <FileText className="h-5 w-5 text-purple-600" />
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
            )
        },
        {
            key: 'requester',
            title: 'Pemohon & Lokasi',
            width: '25%',
            render: (request) => (
                <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {request.full_name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                            <Home className="h-3 w-3 mr-1" />
                            RT {request.rt_no?.toString().padStart(2, '0')}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'rt_approved',
            title: 'Disetujui RT',
            width: '20%',
            render: (request) => (
                <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {request.rt_approved_at ? 
                        new Date(request.rt_approved_at).toLocaleDateString('id-ID') : 
                        '-'
                    }
                </div>
            )
        },
        {
            key: 'priority',
            title: 'Prioritas',
            width: '20%',
            render: (request) => getPriorityBadge(request.rt_approved_at)
        },
        {
            key: 'actions',
            title: 'Aksi',
            width: '10%',
            render: (request) => (
                <button
                    onClick={() => handleApproval(request)}
                    className="inline-flex items-center px-3 py-1 border border-purple-300 rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
                >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Proses
                </button>
            )
        }
    ], [getPriorityBadge]);

    // Optimized callbacks
    const handleApproval = useCallback((request) => {
        setSelectedRequest(request);
        setShowApprovalModal(true);
    }, []);

    const handleApprovalSubmit = useCallback(({ id, data }) => {
        rwApproval({ id, data });
        setShowApprovalModal(false);
        setSelectedRequest(null);
    }, [rwApproval]);

    const handleCloseModal = useCallback(() => {
        setShowApprovalModal(false);
        setSelectedRequest(null);
    }, []);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const handlePeriodChange = useCallback((period) => {
        setSelectedPeriod(period);
    }, []);

    // Memoized performance summary
    const performanceSummary = useMemo(() => [
        {
            title: 'Efisiensi Proses',
            value: statistics.avgProcessingTime ? `Rata-rata ${statistics.avgProcessingTime} hari` : 'Belum ada data',
            icon: BarChart3,
            color: 'blue'
        },
        {
            title: 'Tingkat Persetujuan',
            value: statistics.total > 0 ? 
                `${Math.round(((statistics.byStatus?.COMPLETED || 0) / statistics.total) * 100)}% disetujui` :
                'Belum ada data',
            icon: TrendingUp,
            color: 'green'
        },
        {
            title: 'Status Sistem',
            value: pendingRequests.pagination?.total === 0 ? 
                'Semua terkini' : 
                `${pendingRequests.pagination?.total || 0} menunggu`,
            icon: Shield,
            color: 'purple'
        }
    ], [statistics, pendingRequests.pagination?.total]);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-2">
                                    Dashboard RW - Surat Pengantar
                                </h1>
                                <p className="text-purple-100">
                                    Kelola persetujuan final surat pengantar dari seluruh RT dalam RW Anda
                                </p>
                            </div>
                            <div className="hidden sm:block">
                                <div className="h-16 w-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                                    <Shield className="h-8 w-8 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Stats */}
                    <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {statsCards.map((stat, index) => (
                                <StatCard
                                    key={index}
                                    title={stat.title}
                                    value={stat.value}
                                    icon={stat.icon}
                                    color={stat.color}
                                    trend={stat.trend}
                                    trendValue={stat.trendValue}
                                    loading={statisticsLoading}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Period Filter */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                📊 Statistik Periode
                            </h3>
                            <p className="text-sm text-gray-600">
                                Pilih periode untuk melihat statistik yang berbeda
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Periode:</label>
                            <select
                                value={selectedPeriod}
                                onChange={(e) => handlePeriodChange(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="week">Minggu Ini</option>
                                <option value="month">Bulan Ini</option>
                                <option value="quarter">Kuartal Ini</option>
                                <option value="year">Tahun Ini</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Pending Requests Table */}
                <div className="mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            📋 Pengajuan Menunggu Persetujuan RW
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Daftar pengajuan yang sudah disetujui RT dan menunggu persetujuan final RW
                        </p>
                    </div>

                    <DataTable
                        columns={tableColumns}
                        data={pendingRequests.data}
                        loading={pendingRWLoading}
                        pagination={{
                            currentPage,
                            totalPages: pendingRequests.pagination?.totalPages || 1,
                            total: pendingRequests.pagination?.total || 0,
                            limit: 10
                        }}
                        onPageChange={handlePageChange}
                        emptyMessage="Tidak Ada Pengajuan Pending"
                        emptyDescription="Semua pengajuan dari RT sudah diproses atau belum ada pengajuan baru"
                        emptyIcon={CheckCircle}
                    />
                </div>

                {/* Quick Stats Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        📈 Ringkasan Kinerja RW
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {performanceSummary.map((item, index) => (
                            <div key={index} className={`bg-gradient-to-r ${
                                item.color === 'blue' ? 'from-blue-50 to-indigo-50 border-blue-200' :
                                item.color === 'green' ? 'from-green-50 to-emerald-50 border-green-200' :
                                'from-purple-50 to-violet-50 border-purple-200'
                            } rounded-lg p-4 border`}>
                                <div className="flex items-center">
                                    <item.icon className={`h-8 w-8 mr-3 ${
                                        item.color === 'blue' ? 'text-blue-600' :
                                        item.color === 'green' ? 'text-green-600' :
                                        'text-purple-600'
                                    }`} />
                                    <div>
                                        <h4 className={`font-medium ${
                                            item.color === 'blue' ? 'text-blue-900' :
                                            item.color === 'green' ? 'text-green-900' :
                                            'text-purple-900'
                                        }`}>
                                            {item.title}
                                        </h4>
                                        <p className={`text-sm ${
                                            item.color === 'blue' ? 'text-blue-700' :
                                            item.color === 'green' ? 'text-green-700' :
                                            'text-purple-700'
                                        }`}>
                                            {item.value}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Approval Modal */}
                <ApprovalModal
                    isOpen={showApprovalModal}
                    onClose={handleCloseModal}
                    request={selectedRequest}
                    onApprove={handleApprovalSubmit}
                    isProcessing={isRWProcessing}
                    type="RW"
                />
            </div>
        </div>
    );
};

export default RWDashboard;