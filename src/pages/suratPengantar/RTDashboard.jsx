// src/pages/suratPengantar/RTDashboard.jsx
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
    MessageSquare,
    Eye
} from 'lucide-react';
import { useSuratPengantar } from '../../hooks/useSuratPengantar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ApprovalModal = ({ isOpen, onClose, request, onApprove, isProcessing }) => {
    const [action, setAction] = useState('');
    const [notes, setNotes] = useState('');

    if (!isOpen || !request) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!action) return;
        
        onApprove({
            id: request.id,
            data: { action, notes: notes.trim() || undefined }
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Proses Persetujuan RT
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XCircle className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Request Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h4 className="font-medium text-gray-900 mb-2">{request.category_name}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center">
                                <User className="h-4 w-4 mr-2" />
                                {request.full_name} - NIK: {request.nik?.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-****-****-$4')}
                            </div>
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                Diajukan: {new Date(request.submitted_at).toLocaleDateString('id-ID')}
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Alasan:</p>
                            <p className="text-sm text-gray-600">{request.reason}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Action Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Keputusan <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-3">
                                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="action"
                                        value="A"
                                        checked={action === 'A'}
                                        onChange={(e) => setAction(e.target.value)}
                                        className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                                    />
                                    <div className="ml-3">
                                        <div className="flex items-center">
                                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                            <span className="text-sm font-medium text-gray-900">Setujui</span>
                                        </div>
                                        <p className="text-xs text-gray-500">Menyetujui pengajuan untuk diteruskan ke RW</p>
                                    </div>
                                </label>
                                
                                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="action"
                                        value="R"
                                        checked={action === 'R'}
                                        onChange={(e) => setAction(e.target.value)}
                                        className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                                    />
                                    <div className="ml-3">
                                        <div className="flex items-center">
                                            <XCircle className="h-5 w-5 text-red-600 mr-2" />
                                            <span className="text-sm font-medium text-gray-900">Tolak</span>
                                        </div>
                                        <p className="text-xs text-gray-500">Menolak pengajuan dengan alasan tertentu</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Catatan {action === 'R' && <span className="text-red-500">*</span>}
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={action === 'A' ? "Catatan persetujuan (opsional)" : "Jelaskan alasan penolakan"}
                                required={action === 'R'}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {action === 'A' ? 'Tambahkan catatan jika diperlukan' : 'Wajib diisi untuk penolakan'}
                            </p>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isProcessing}
                                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={!action || isProcessing || (action === 'R' && !notes.trim())}
                                className={`flex-1 py-2 px-4 text-white rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                                    action === 'A' 
                                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                                        : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                }`}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                                        Memproses...
                                    </>
                                ) : (
                                    action === 'A' ? 'Setujui Pengajuan' : 'Tolak Pengajuan'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const RTDashboard = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    
    const { 
        pendingRTRequests, 
        pendingRTLoading, 
        fetchPendingRT, 
        rtApproval, 
        isRTProcessing,
        statistics,
        statisticsLoading,
        fetchStatistics
    } = useSuratPengantar();

    useEffect(() => {
        fetchPendingRT({ page: currentPage, limit: 10 });
        fetchStatistics({ period: 'month' });
    }, [currentPage, fetchPendingRT, fetchStatistics]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleApproval = (request) => {
        setSelectedRequest(request);
        setShowApprovalModal(true);
    };

    const handleApprovalSubmit = ({ id, data }) => {
        rtApproval({ id, data });
        setShowApprovalModal(false);
        setSelectedRequest(null);
    };

    const handleCloseModal = () => {
        setShowApprovalModal(false);
        setSelectedRequest(null);
    };

    const getUrgencyBadge = (submittedAt) => {
        const daysSince = Math.floor((new Date() - new Date(submittedAt)) / (1000 * 60 * 60 * 24));
        
        if (daysSince >= 3) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
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
                Baru
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-2">
                                    Dashboard RT - Surat Pengantar
                                </h1>
                                <p className="text-blue-100">
                                    Kelola persetujuan surat pengantar dari warga RT Anda
                                </p>
                            </div>
                            <div className="hidden sm:block">
                                <div className="h-16 w-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                                    <FileText className="h-8 w-8 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { 
                                    label: 'Menunggu Persetujuan', 
                                    value: pendingRTRequests.pagination?.total || 0, 
                                    color: 'text-orange-600',
                                    icon: Clock
                                },
                                { 
                                    label: 'Total Bulan Ini', 
                                    value: statistics.total || 0, 
                                    color: 'text-blue-600',
                                    icon: FileText
                                },
                                { 
                                    label: 'Disetujui', 
                                    value: statistics.byStatus?.RT_APPROVED || 0, 
                                    color: 'text-green-600',
                                    icon: CheckCircle
                                },
                                { 
                                    label: 'Ditolak', 
                                    value: statistics.byStatus?.REJECTED || 0, 
                                    color: 'text-red-600',
                                    icon: XCircle
                                }
                            ].map((stat, index) => (
                                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-center mb-2">
                                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                    <div className={`text-2xl font-bold ${stat.color}`}>
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-gray-500">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pending Requests */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            📋 Pengajuan Menunggu Persetujuan
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Daftar pengajuan surat pengantar yang perlu disetujui
                        </p>
                    </div>

                    {pendingRTLoading ? (
                        <div className="p-8">
                            <LoadingSpinner text="Memuat pengajuan..." />
                        </div>
                    ) : pendingRTRequests.data?.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Tidak Ada Pengajuan Pending
                            </h3>
                            <p className="text-gray-500">
                                Semua pengajuan sudah diproses atau belum ada pengajuan baru
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
                                            Tanggal
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Prioritas
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pendingRTRequests.data?.map((request) => (
                                        <tr key={request.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
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
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 text-gray-400 mr-2" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {request.full_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {request.address}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    {formatDate(request.submitted_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getUrgencyBadge(request.submitted_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleApproval(request)}
                                                        className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                                    >
                                                        <MessageSquare className="h-4 w-4 mr-1" />
                                                        Proses
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pendingRTRequests.pagination && pendingRTRequests.pagination.totalPages > 1 && (
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
                                        onClick={() => setCurrentPage(Math.min(pendingRTRequests.pagination.totalPages, currentPage + 1))}
                                        disabled={currentPage === pendingRTRequests.pagination.totalPages}
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
                                                {Math.min(currentPage * 10, pendingRTRequests.pagination.total)}
                                            </span>{' '}
                                            dari{' '}
                                            <span className="font-medium">{pendingRTRequests.pagination.total}</span>{' '}
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
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            
                                            {Array.from({ length: Math.min(5, pendingRTRequests.pagination.totalPages) }, (_, i) => {
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
                                                onClick={() => setCurrentPage(Math.min(pendingRTRequests.pagination.totalPages, currentPage + 1))}
                                                disabled={currentPage === pendingRTRequests.pagination.totalPages}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">Selanjutnya</span>
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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

                {/* Approval Modal */}
                <ApprovalModal
                    isOpen={showApprovalModal}
                    onClose={handleCloseModal}
                    request={selectedRequest}
                    onApprove={handleApprovalSubmit}
                    isProcessing={isRTProcessing}
                />
            </div>
        </div>
    );
};

export default RTDashboard;