// src/routes/publicRoutes.js - Public routes (no authentication required)
import { Route, Navigate } from 'react-router-dom';

// Public Components
import QRCodeVerification from '../pages/suratPengantar/QRCodeVerification';

// Test Page Component
const TestPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
                <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                    <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0v-4a2 2 0 012-2h2a2 2 0 012 2v4" />
                    </svg>
                </div>
                <h1 className="text-5xl font-bold text-gray-900 mb-4">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        SMART-RW
                    </span>
                </h1>
                <p className="text-xl text-gray-600 mb-2">Sistem Manajemen RT-RW Digital</p>
                <p className="text-gray-500">Development server berhasil berjalan! 🚀</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Akses Aplikasi</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <a 
                        href="/login" 
                        className="block p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                        <div className="text-2xl mb-2">🔐</div>
                        <h3 className="text-lg font-semibold mb-2">Login</h3>
                        <p className="text-blue-100 text-sm">Masuk ke akun Anda</p>
                    </a>
                    
                    <a 
                        href="/register" 
                        className="block p-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                        <div className="text-2xl mb-2">📝</div>
                        <h3 className="text-lg font-semibold mb-2">Register</h3>
                        <p className="text-green-100 text-sm">Daftar akun baru</p>
                    </a>
                </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Status Development</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center text-green-600">
                        <span className="mr-2">✅</span>
                        Auth System
                    </div>
                    <div className="flex items-center text-green-600">
                        <span className="mr-2">✅</span>
                        Email Verify
                    </div>
                    <div className="flex items-center text-green-600">
                        <span className="mr-2">✅</span>
                        KTP Form
                    </div>
                    <div className="flex items-center text-green-600">
                        <span className="mr-2">✅</span>
                        Profile Form
                    </div>
                    <div className="flex items-center text-green-600">
                        <span className="mr-2">✅</span>
                        Surat Pengantar
                    </div>
                    <div className="flex items-center text-green-600">
                        <span className="mr-2">✅</span>
                        RT Dashboard
                    </div>
                    <div className="flex items-center text-green-600">
                        <span className="mr-2">✅</span>
                        RW Dashboard
                    </div>
                    <div className="flex items-center text-green-600">
                        <span className="mr-2">✅</span>
                        QR Verification
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// 404 Error Page Component
const NotFoundPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <div className="mb-8">
                <div className="mx-auto h-20 w-20 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-4xl">🔍</span>
                </div>
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Halaman Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Maaf, halaman yang Anda cari tidak dapat ditemukan. 
                Mungkin halaman telah dipindahkan atau URL salah.
            </p>
            <div className="space-x-4">
                <a 
                    href="/dashboard" 
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                    🏠 Kembali ke Dashboard
                </a>
                <a 
                    href="/" 
                    className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                    🏁 Halaman Utama
                </a>
            </div>
        </div>
    </div>
);

// Unauthorized Access Page Component
const UnauthorizedPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <div className="mb-8">
                <div className="mx-auto h-20 w-20 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-4xl">🚫</span>
                </div>
            </div>
            <h1 className="text-4xl font-bold text-red-600 mb-4">Akses Ditolak</h1>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Unauthorized Access</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Anda tidak memiliki izin untuk mengakses halaman ini. 
                Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.
            </p>
            <div className="space-x-4">
                <a 
                    href="/dashboard" 
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                    🏠 Kembali ke Dashboard
                </a>
                <a 
                    href="/login" 
                    className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                    🔐 Login Ulang
                </a>
            </div>
        </div>
    </div>
);

const PublicRoutes = () => {
    return (
        <>
            {/* ========================================
                LANDING & TEST ROUTES
                ======================================== */}
            
            {/* Landing Page */}
            <Route path="/" element={<TestPage />} />

            {/* ========================================
                PUBLIC VERIFICATION ROUTES
                ======================================== */}
            
            {/* QR Code Verification - Public untuk verifikasi surat */}
            <Route path="/verify/:token" element={<QRCodeVerification />} />

            {/* ========================================
                ERROR HANDLING ROUTES
                ======================================== */}
            
            {/* 404 - Page Not Found */}
            <Route path="/404" element={<NotFoundPage />} />

            {/* Unauthorized Access */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* ========================================
                REDIRECTS & CATCH ALL
                ======================================== */}
            
            {/* Catch all unmatched routes - redirect to 404 */}
            <Route path="*" element={<Navigate to="/404" replace />} />
        </>
    );
};

export default PublicRoutes;