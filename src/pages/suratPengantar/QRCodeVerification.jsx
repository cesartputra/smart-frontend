// src/pages/suratPengantar/QRCodeVerification.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    QrCode, 
    CheckCircle, 
    XCircle, 
    AlertCircle, 
    User, 
    MapPin, 
    Calendar, 
    FileText,
    Shield,
    Download,
    Loader
} from 'lucide-react';
import { useSuratPengantar } from '../../hooks/useSuratPengantar';

const QRCodeVerification = () => {
    const { token } = useParams();
    const [verificationResult, setVerificationResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { verifyQR, isVerifying } = useSuratPengantar();

    useEffect(() => {
        if (token) {
            handleVerification();
        } else {
            setError('Token verifikasi tidak ditemukan');
            setLoading(false);
        }
    }, [token]);

    const handleVerification = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Call verification service
            const result = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/verify-surat/${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await result.json();
            
            if (result.ok && data.success) {
                setVerificationResult(data);
            } else {
                setError(data.message || 'QR Code tidak valid');
            }
        } catch (err) {
            console.error('Verification error:', err);
            setError('Gagal melakukan verifikasi. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading || isVerifying) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Memverifikasi QR Code
                    </h2>
                    <p className="text-gray-600">
                        Sedang memproses verifikasi, mohon tunggu...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Verifikasi Gagal
                    </h2>
                    <p className="text-red-600 mb-6">
                        {error}
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={handleVerification}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            Coba Lagi
                        </button>
                        <Link
                            to="/"
                            className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                        >
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (verificationResult?.success) {
        const data = verificationResult.data;
        
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
                <div className="max-w-4xl mx-auto py-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            ✅ Surat Pengantar Valid
                        </h1>
                        <p className="text-gray-600">
                            Dokumen ini telah diverifikasi dan sah
                        </p>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Document Header */}
                        <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-8 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">
                                        {data.category_name}
                                    </h2>
                                    <p className="text-green-100">
                                        Dokumen Resmi RT/RW
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end mb-2">
                                        <Shield className="h-5 w-5 mr-2" />
                                        <span className="text-sm font-medium">TERVERIFIKASI</span>
                                    </div>
                                    <p className="text-xs text-green-100">
                                        ID: {data.id}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Document Details */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Personal Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <User className="h-5 w-5 mr-2 text-blue-600" />
                                        Data Pemegang Surat
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Nama Lengkap
                                            </label>
                                            <p className="text-gray-900 font-medium">{data.full_name}</p>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                NIK
                                            </label>
                                            <p className="text-gray-900 font-mono">{data.nik}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <MapPin className="h-5 w-5 mr-2 text-green-600" />
                                        Informasi Lokasi
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                RT / RW
                                            </label>
                                            <p className="text-gray-900">
                                                RT {data.rt_no?.toString().padStart(2, '0')} / 
                                                RW {data.rw_no?.toString().padStart(2, '0')}
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Kelurahan
                                            </label>
                                            <p className="text-gray-900">{data.kelurahan_name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Document Timeline */}
                            <div className="mt-8 border-t border-gray-200 pt-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                                    Timeline Dokumen
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Diselesaikan pada: {formatDate(data.completed_at)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Surat telah disetujui dan diterbitkan
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                            <Shield className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Diverifikasi pada: {formatDate(data.verified_at)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                QR Code berhasil diverifikasi
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Approval Information */}
                            <div className="mt-8 border-t border-gray-200 pt-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Shield className="h-5 w-5 mr-2 text-indigo-600" />
                                    Informasi Persetujuan
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {data.rt_approver_name && (
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <h4 className="font-medium text-blue-900 mb-1">
                                                Disetujui RT
                                            </h4>
                                            <p className="text-sm text-blue-800">
                                                {data.rt_approver_name}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {data.rw_approver_name && (
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <h4 className="font-medium text-green-900 mb-1">
                                                Disetujui RW
                                            </h4>
                                            <p className="text-sm text-green-800">
                                                {data.rw_approver_name}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Security Notice */}
                            <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
                                <div className="flex items-start">
                                    <QrCode className="h-6 w-6 text-purple-600 mr-3 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-purple-900 mb-2">
                                            🔒 Dokumen Aman & Terverifikasi
                                        </h4>
                                        <div className="text-sm text-purple-800 space-y-1">
                                            <p>• Dokumen ini dilindungi dengan QR Code yang unik</p>
                                            <p>• Verifikasi dilakukan secara real-time dengan sistem database</p>
                                            <p>• Dokumen telah melalui proses persetujuan RT dan RW yang sah</p>
                                            <p>• Dokumen ini dapat dipercaya untuk keperluan administrasi</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-8 text-center">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <p className="text-gray-600 mb-4">
                                Butuh bantuan atau memiliki pertanyaan tentang dokumen ini?
                            </p>
                            <div className="space-y-3 sm:space-y-0 sm:space-x-3 sm:flex sm:justify-center">
                                <button
                                    onClick={() => window.print()}
                                    className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Cetak Halaman
                                </button>
                                <Link
                                    to="/"
                                    className="w-full sm:w-auto bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 inline-flex items-center justify-center"
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Kembali ke Beranda
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default QRCodeVerification;