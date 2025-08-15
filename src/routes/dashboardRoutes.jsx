// src/routes/dashboardRoutes.js - Dashboard and main app routes
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Dashboard Components
import Dashboard from '../pages/Dashboard';

const DashboardRoutes = () => {
    return (
        <>
            {/* ========================================
                MAIN DASHBOARD ROUTES
                Requires: Full Profile (Auth + Email + KTP + User Details)
                ======================================== */}
            
            {/* Main Dashboard */}
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute requiresKTP requiresUserDetails>
                        <Dashboard />
                    </ProtectedRoute>
                } 
            />

            {/* ========================================
                FEATURE SHORTCUTS
                Quick access routes to main features
                ======================================== */}
            
            {/* Home - redirect to dashboard */}
            <Route 
                path="/home" 
                element={
                    <ProtectedRoute requiresKTP requiresUserDetails>
                        <Dashboard />
                    </ProtectedRoute>
                } 
            />

            {/* Main - redirect to dashboard */}
            <Route 
                path="/main" 
                element={
                    <ProtectedRoute requiresKTP requiresUserDetails>
                        <Dashboard />
                    </ProtectedRoute>
                } 
            />

            {/* ========================================
                QUICK ACCESS ROUTES
                Shortcuts untuk fitur yang sering digunakan
                ======================================== */}
            
            {/* Quick Surat Pengantar */}
            <Route 
                path="/quick/surat" 
                element={
                    <ProtectedRoute requiresKTP requiresUserDetails>
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">🚀 Quick Access</h1>
                                <p className="text-gray-600 mb-4">Akses cepat ke fitur Surat Pengantar</p>
                                <div className="space-x-4">
                                    <a 
                                        href="/surat-pengantar" 
                                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        📋 Lihat Semua Surat
                                    </a>
                                    <a 
                                        href="/surat-pengantar/create" 
                                        className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        ➕ Buat Surat Baru
                                    </a>
                                </div>
                            </div>
                        </div>
                    </ProtectedRoute>
                } 
            />

            {/* ========================================
                HELP & SUPPORT ROUTES
                ======================================== */}
            
            {/* Help Center */}
            <Route 
                path="/help" 
                element={
                    <ProtectedRoute requiresKTP requiresUserDetails>
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center max-w-2xl mx-auto">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">❓ Pusat Bantuan</h1>
                                <p className="text-gray-600 mb-8">Temukan jawaban untuk pertanyaan umum</p>
                                
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Surat Pengantar</h3>
                                        <ul className="text-left text-gray-600 space-y-2 text-sm">
                                            <li>• Cara membuat surat pengantar</li>
                                            <li>• Proses persetujuan RT/RW</li>
                                            <li>• Download dan cetak surat</li>
                                        </ul>
                                    </div>
                                    
                                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">👤 Profil & Akun</h3>
                                        <ul className="text-left text-gray-600 space-y-2 text-sm">
                                            <li>• Update data pribadi</li>
                                            <li>• Verifikasi email</li>
                                            <li>• Kelengkapan KTP</li>
                                        </ul>
                                    </div>
                                </div>
                                
                                <div className="mt-8">
                                    <p className="text-gray-500 text-sm">
                                        Masih butuh bantuan? Hubungi RT/RW setempat
                                    </p>
                                </div>
                            </div>
                        </div>
                    </ProtectedRoute>
                } 
            />

            {/* FAQ */}
            <Route 
                path="/faq" 
                element={
                    <ProtectedRoute requiresKTP requiresUserDetails>
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">🙋‍♀️ FAQ</h1>
                                <p className="text-gray-600 mb-4">Pertanyaan yang Sering Diajukan</p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-blue-800">FAQ Section - Coming Soon...</p>
                                </div>
                            </div>
                        </div>
                    </ProtectedRoute>
                } 
            />
        </>
    );
};

export default DashboardRoutes;