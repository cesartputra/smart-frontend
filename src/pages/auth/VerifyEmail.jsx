// src/pages/auth/VerifyEmail.jsx - Tambah auth check
import { useEffect, useState } from 'react';
import { useLocation, useSearchParams, Link, Navigate } from 'react-router-dom';
import { Mail, CheckCircle, RotateCcw, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useAuthStore from '../../store/authStore';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState('pending');
    const [verificationMessage, setVerificationMessage] = useState('');
    
    const { verifyEmail, resendVerification, isLoading } = useAuth();
    const { isAuthenticated, user } = useAuthStore();

    // Debug auth state
    console.log('🔍 VerifyEmail - Auth State:', {
        isAuthenticated,
        user: user ? { email: user.email, isEmailVerified: user.isEmailVerified } : null,
        hasToken: !!localStorage.getItem('accessToken'),
        pathname: location.pathname
    });

    // Redirect if already fully authenticated and verified
    if (isAuthenticated && user?.isEmailVerified) {
        console.log('✅ User already verified, redirecting...');
        return <Navigate to="/complete-ktp" replace />;
    }

    useEffect(() => {
        // Get email from location state or URL params
        const emailFromState = location.state?.email;
        const emailFromParams = searchParams.get('email');
        const tokenFromParams = searchParams.get('token');
        
        console.log('📧 VerifyEmail useEffect:', {
        emailFromState,
        emailFromParams,
        tokenFromParams,
        isAuthenticated,
        userEmail: user?.email
        });

        // Set email from various sources
        if (emailFromState || emailFromParams || user?.email) {
        setEmail(emailFromState || emailFromParams || user?.email);
        }

        // Auto verify if token is in URL
        if (tokenFromParams) {
        console.log('🔑 Token found in URL, starting verification...');
        setVerificationStatus('verifying');
        verifyEmailWithToken(tokenFromParams);
        }
    }, [location.state, searchParams, user?.email]);

    const verifyEmailWithToken = async (token) => {
        console.log('🎯 verifyEmailWithToken START with token:', token);
        
        try {
        setVerificationStatus('verifying');
        setVerificationMessage('Memverifikasi email Anda...');
        
        console.log('🚀 About to call useAuth.verifyEmail...');
        const result = await verifyEmail(token);
        
        console.log('✅ verifyEmailWithToken SUCCESS:', result);
        
        setVerificationStatus('success');
        setVerificationMessage('Email berhasil diverifikasi! Akun Anda telah aktif.');
        
        } catch (error) {
        console.log('❌ verifyEmailWithToken CATCH ERROR:', error);
        
        setVerificationStatus('error');
        
        let errorMessage = 'Gagal memverifikasi email.';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        setVerificationMessage(errorMessage);
        }
    };

    useEffect(() => {
        // Countdown for resend button
        if (countdown > 0 && canResend === false) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
        } else if (countdown === 0) {
        setCanResend(true);
        }
    }, [countdown, canResend]);

    const handleResend = async () => {
        if (email && canResend) {
        try {
            await resendVerification(email);
            setCountdown(60);
            setCanResend(false);
            setVerificationStatus('pending');
            setVerificationMessage('');
        } catch (error) {
            console.error('❌ Resend failed:', error);
        }
        }
    };

    // Render content based on verification status
    const renderContent = () => {
        switch (verificationStatus) {
        case 'verifying':
            return (
            <div className="text-center">
                <Loader className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                Memverifikasi Email
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                {verificationMessage}
                </p>
            </div>
            );

        case 'success':
            return (
            <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                Email Berhasil Diverifikasi! 🎉
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                {verificationMessage}
                </p>
                <Link
                to="/complete-ktp"
                className="w-full inline-flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                >
                Lengkapi Profil KTP →
                </Link>
            </div>
            );

        case 'error':
            return (
            <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                Verifikasi Gagal
                </h3>
                <p className="text-sm text-red-600 mb-6">
                {verificationMessage}
                </p>
                <div className="space-y-4">
                {email && (
                    <button
                    onClick={handleResend}
                    disabled={!canResend || isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                    {isLoading ? (
                        <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Mengirim...
                        </>
                    ) : canResend ? (
                        <>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Kirim Ulang Email
                        </>
                    ) : (
                        <>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Kirim Ulang ({countdown}s)
                        </>
                    )}
                    </button>
                )}
                <Link
                    to="/login"
                    className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                    Kembali ke Login
                </Link>
                </div>
            </div>
            );

        default: // pending
            return (
            <div className="text-center">
                <CheckCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                Periksa Email Anda
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                Klik link verifikasi dalam email untuk mengaktifkan akun Anda. 
                Email mungkin masuk ke folder spam.
                </p>

                <div className="border-t pt-6">
                <p className="text-sm text-gray-600 text-center mb-4">
                    Belum menerima email?
                </p>
                
                <button
                    onClick={handleResend}
                    disabled={!canResend || isLoading || !email}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    {isLoading ? (
                    <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Mengirim ulang...
                    </>
                    ) : canResend ? (
                    <>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Kirim Ulang Email
                    </>
                    ) : (
                    <>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Kirim Ulang ({countdown}s)
                    </>
                    )}
                </button>
                </div>

                {/* Additional Actions */}
                <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 text-center mb-4">
                    Atau
                </p>
                <Link
                    to="/login"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                    Kembali ke Login
                </Link>
                </div>
            </div>
            );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
            {/* Header */}
            <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Mail className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
                Verifikasi Email Anda
            </h2>
            <p className="mt-2 text-sm text-gray-600">
                Kami telah mengirimkan email verifikasi ke
            </p>
            <p className="text-sm font-medium text-blue-600">
                {email || 'email Anda'}
            </p>
            </div>

            {/* Dynamic Content Card */}
            <div className="bg-white rounded-xl shadow-2xl p-8 space-y-6">
            {renderContent()}

            {/* Tips Section - only show if pending */}
            {verificationStatus === 'pending' && (
                <div className="border-t pt-6">
                <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Tips:
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Periksa folder spam/junk</li>
                    <li>• Pastikan email tidak diblokir</li>
                    <li>• Link berlaku selama 24 jam</li>
                    <li>• Hubungi admin jika masih bermasalah</li>
                    </ul>
                </div>
                </div>
            )}
            </div>

            {/* Footer */}
            {verificationStatus !== 'success' && (
            <div className="text-center">
                <p className="text-xs text-gray-600">
                Salah email?{' '}
                <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-500 font-medium"
                >
                    Daftar ulang dengan email yang benar
                </Link>
                </p>
            </div>
            )}
        </div>
        </div>
    );
};

export default VerifyEmail;