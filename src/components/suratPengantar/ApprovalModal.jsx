// src/components/suratPengantar/ApprovalModal.jsx
import React, { useState, useEffect, memo } from 'react';
import { XCircle, CheckCircle, User, Calendar, MapPin } from 'lucide-react';

const ApprovalModal = memo(({ 
    isOpen, 
    onClose, 
    request, 
    onApprove, 
    isProcessing = false,
    type = 'RT' // 'RT' or 'RW'
    }) => {
    const [action, setAction] = useState('');
    const [notes, setNotes] = useState('');

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
        setAction('');
        setNotes('');
        }
    }, [isOpen]);

    if (!isOpen || !request) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!action) return;
        
        onApprove({
        id: request.id,
        data: { action, notes: notes.trim() || undefined }
        });
    };

    const isRW = type === 'RW';
    const approveText = isRW ? 'Setujui & Selesaikan' : 'Setujui';
    const approveDescription = isRW 
        ? 'Menyetujui dan menyelesaikan pengajuan surat pengantar'
        : 'Menyetujui pengajuan untuk diteruskan ke RW';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                Proses Persetujuan {type}
                </h3>
                <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isProcessing}
                >
                <XCircle className="h-6 w-6" />
                </button>
            </div>
            </div>

            <div className="p-6">
            {/* Request Info Card */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">{request.category_name}</h4>
                <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{request.full_name} - NIK: {request.nik?.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-****-****-$4')}</span>
                </div>
                
                {isRW && (
                    <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>RT {request.rt_no?.toString().padStart(2, '0')} - {request.address}</span>
                    </div>
                )}
                
                <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                    {isRW 
                        ? `Disetujui RT: ${new Date(request.rt_approved_at).toLocaleDateString('id-ID')}`
                        : `Diajukan: ${new Date(request.submitted_at).toLocaleDateString('id-ID')}`
                    }
                    </span>
                </div>
                </div>
                
                {/* Reason */}
                <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Alasan:</p>
                <p className="text-sm text-gray-600 bg-white rounded p-3 border">
                    {request.reason}
                </p>
                </div>
                
                {/* RT Notes for RW */}
                {isRW && request.rt_notes && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-800 mb-1">Catatan RT:</p>
                    <p className="text-sm text-blue-700">{request.rt_notes}</p>
                </div>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                {/* Action Selection */}
                <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Keputusan <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                    <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                        type="radio"
                        name="action"
                        value="A"
                        checked={action === 'A'}
                        onChange={(e) => setAction(e.target.value)}
                        className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500 mt-0.5"
                        disabled={isProcessing}
                    />
                    <div className="ml-3">
                        <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{approveText}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{approveDescription}</p>
                    </div>
                    </label>
                    
                    <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                        type="radio"
                        name="action"
                        value="R"
                        checked={action === 'R'}
                        onChange={(e) => setAction(e.target.value)}
                        className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500 mt-0.5"
                        disabled={isProcessing}
                    />
                    <div className="ml-3">
                        <div className="flex items-center">
                        <XCircle className="h-5 w-5 text-red-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Tolak</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Menolak pengajuan dengan alasan tertentu</p>
                    </div>
                    </label>
                </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan {type} {action === 'R' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder={action === 'A' ? `Catatan persetujuan ${type} (opsional)` : "Jelaskan alasan penolakan"}
                    required={action === 'R'}
                    disabled={isProcessing}
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
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Memproses...
                    </div>
                    ) : (
                    action === 'A' ? approveText : 'Tolak Pengajuan'
                    )}
                </button>
                </div>
            </form>
            </div>
        </div>
        </div>
    );
    });

    ApprovalModal.displayName = 'ApprovalModal';

    // src/components/suratPengantar/LoadingStateCard.jsx
    export const LoadingStateCard = memo(() => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
    </div>
    ));

    LoadingStateCard.displayName = 'LoadingStateCard';

    // src/components/suratPengantar/EmptyState.jsx
    export const EmptyState = memo(({ 
    icon: Icon, 
    title, 
    description, 
    actionText, 
    onAction 
    }) => (
    <div className="text-center py-12">
        {Icon && <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
        </h3>
        <p className="text-gray-500 mb-6">
        {description}
        </p>
        {actionText && onAction && (
        <button
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
            {actionText}
        </button>
        )}
    </div>
));

EmptyState.displayName = 'EmptyState';

export default ApprovalModal;