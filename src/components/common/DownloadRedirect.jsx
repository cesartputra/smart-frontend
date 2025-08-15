// src/components/common/DownloadRedirect.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Download, LogIn, AlertCircle, FileText } from 'lucide-react';

const DownloadRedirect = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();

    useEffect(() => {
        console.log('🔧 DownloadRedirect mounted:', { id, user: !!user, authLoading });
        
        // Jika masih loading auth state, tunggu dulu
        if (authLoading) {
            console.log('⏳ Auth loading, waiting...');
            return;
        }

        // Jika user belum login
        if (!user) {
            console.log('🔒 User not authenticated, redirecting to login');
            
            // Simpan intended URL untuk redirect setelah login
            const intendedUrl = `/surat-pengantar/${id}/download`;
            localStorage.setItem('intendedUrl', intendedUrl);
            
            // Redirect ke login dengan message
            navigate(`/login?redirect=download&id=${id}`, { 
                replace: true,
                state: { 
                    message: 'Silakan login terlebih dahulu untuk mengunduh surat pengantar',
                    type: 'info'
                }
            });
            return;
        }

        console.log('✅ User authenticated, redirecting to detail page');
        
        // Jika user sudah login, redirect ke detail page dengan auto download
        navigate(`/surat-pengantar/${id}?autoDownload=true`, { 
            replace: true 
        });

    }, [user, authLoading, id, navigate]);

    // Loading state saat mengecek auth
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Memverifikasi Login
                        </h3>
                        <p className="text-gray-600">
                            Mohon tunggu sebentar...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback state (shouldn't reach here normally)
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md w-full mx-4">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                        <Download className="h-8 w-8 text-blue-600" />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Memproses Download
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Mengarahkan ke halaman yang sesuai...
                    </p>
                    
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm"
                        >
                            <LogIn className="h-4 w-4 mr-2" />
                            Login untuk Download
                        </button>
                        
                        <button
                            onClick={() => navigate('/')}
                            className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Kembali ke Beranda
                        </button>
                    </div>
                    
                    <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center text-yellow-700">
                            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                            <p className="text-xs">
                                Untuk keamanan, login diperlukan untuk mengunduh dokumen
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DownloadRedirect;