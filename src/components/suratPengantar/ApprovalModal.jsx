// src/components/suratPengantar/ApprovalModal.jsx
import React, { useState, useEffect, memo } from 'react';
import { XCircle, CheckCircle, User, Calendar, MapPin, X } from 'lucide-react';

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

    // Close modal on ESC key
    useEffect(() => {
        const handleEscape = (e) => {
        if (e.key === 'Escape' && isOpen && !isProcessing) {
            onClose();
        }
        };

        if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
        }

        return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
        };
    }, [isOpen, isProcessing, onClose]);

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

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
            <div className="flex items-center justify-between">
                <div>
                <h3 className="text-lg font-semibold text-gray-900">
                    Proses Persetujuan {type}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                    {isRW ? 'Persetujuan final untuk surat pengantar' : 'Persetujuan tingkat RT'}
                </p>
                </div>
                <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                disabled={isProcessing}
                title="Tutup modal"
                >
                <X className="h-5 w-5" />
                </button>
            </div>
            </div>

            <div className="p-6">
            {/* Request Info Card */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-6 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <div className="h-2 w-2 bg-blue-500 rounded-full mr-2"></div>
                {request.category_name}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="space-y-2">
                    <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                    <div>
                        <div className="font-medium text-gray-900">{request.full_name}</div>
                        <div className="text-xs">NIK: {request.nik?.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-****-****-$4')}</div>
                    </div>
                    </div>
                    
                    {isRW && (
                    <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                        <span>RT {request.rt_no?.toString().padStart(2, '0')} - {request.address}</span>
                    </div>
                    )}
                </div>
                
                <div className="space-y-2">
                    <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                    <div>
                        <div className="text-xs font-medium text-gray-700">
                        {isRW ? 'Disetujui RT' : 'Diajukan'}
                        </div>
                        <div>
                        {formatDate(isRW ? request.rt_approved_at : request.submitted_at)}
                        </div>
                    </div>
                    </div>
                </div>
                </div>
                
                {/* Reason */}
                <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Alasan Pengajuan:</p>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-600">{request.reason}</p>
                </div>
                </div>
                
                {/* RT Notes for RW */}
                {isRW && request.rt_notes && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-800 mb-1">
                    💬 Catatan dari RT:
                    </p>
                    <p className="text-sm text-blue-700">{request.rt_notes}</p>
                </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Action Selection */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Pilih Keputusan <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                    <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200 group">
                    <input
                        type="radio"
                        name="action"
                        value="A"
                        checked={action === 'A'}
                        onChange={(e) => setAction(e.target.value)}
                        className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500 mt-0.5"
                        disabled={isProcessing}
                    />
                    <div className="ml-3 flex-1">
                        <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{approveText}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{approveDescription}</p>
                    </div>
                    </label>
                    
                    <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200 group">
                    <input
                        type="radio"
                        name="action"
                        value="R"
                        checked={action === 'R'}
                        onChange={(e) => setAction(e.target.value)}
                        className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500 mt-0.5"
                        disabled={isProcessing}
                    />
                    <div className="ml-3 flex-1">
                        <div className="flex items-center">
                        <XCircle className="h-5 w-5 text-red-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Tolak Pengajuan</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Menolak pengajuan dengan memberikan alasan yang jelas</p>
                    </div>
                    </label>
                </div>
                </div>

                {/* Notes */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan {type} {action === 'R' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors duration-200"
                    placeholder={action === 'A' ? `Tambahkan catatan persetujuan ${type} (opsional)...` : "Jelaskan alasan penolakan dengan detail..."}
                    required={action === 'R'}
                    disabled={isProcessing}
                />
                <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                    {action === 'A' ? 'Catatan bersifat opsional untuk persetujuan' : 'Catatan wajib diisi untuk penolakan'}
                    </p>
                    <span className="text-xs text-gray-400">
                    {notes.length}/500
                    </span>
                </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isProcessing}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={!action || isProcessing || (action === 'R' && !notes.trim())}
                    className={`flex-1 py-3 px-4 text-white rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium ${
                    action === 'A' 
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                        : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    }`}
                >
                    {isProcessing ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Memproses...
                    </div>
                    ) : (
                    <div className="flex items-center justify-center">
                        {action === 'A' ? (
                        <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {approveText}
                        </>
                        ) : (
                        <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Tolak Pengajuan
                        </>
                        )}
                    </div>
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

export default ApprovalModal;