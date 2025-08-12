// src/App.jsx - UPDATED dengan routes surat pengantar lengkap
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import CompleteKTP from './pages/ktp/CompleteKTP';
import CompleteProfile from './pages/profile/CompleteProfile';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleProtectedRoute from './components/common/RoleProtectedRoute';

// Surat Pengantar Components
import SuratPengantarList from './pages/suratPengantar/SuratPengantarList';
import CreateSuratPengantar from './pages/suratPengantar/CreateSuratPengantar';
import SuratPengantarDetail from './pages/suratPengantar/SuratPengantarDetail';
import RTDashboard from './pages/suratPengantar/RTDashboard';
import RWDashboard from './pages/suratPengantar/RWDashboard';
import AdminSuratPengantarDashboard from './pages/suratPengantar/AdminSuratPengantarDashboard';
import QRCodeVerification from './pages/suratPengantar/QRCodeVerification';

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

function App() {
    return (
        <div className="min-h-screen">
            <Routes>
                {/* ========================================
                    PUBLIC ROUTES (No Authentication Required)
                    ======================================== */}
                
                {/* Test & Landing Page */}
                <Route path="/test" element={<TestPage />} />
                
                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* QR Code Verification - Public untuk verifikasi surat */}
                <Route path="/verify/:token" element={<QRCodeVerification />} />

                {/* ========================================
                    SEMI-PROTECTED ROUTES
                    ======================================== */}
                
                {/* Email verification - accessible without full auth */}
                <Route path="/verify-email" element={<VerifyEmail />} />

                {/* ========================================
                    BASIC PROTECTED ROUTES
                    Requires: Authentication + Email Verification
                    ======================================== */}
                
                {/* Profile Completion Routes */}
                <Route 
                    path="/complete-ktp" 
                    element={
                        <ProtectedRoute>
                            <CompleteKTP />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/complete-profile" 
                    element={
                        <ProtectedRoute requiresKTP>
                            <CompleteProfile />
                        </ProtectedRoute>
                    } 
                />

                {/* ========================================
                    FULL PROTECTED ROUTES
                    Requires: Auth + Email + KTP + User Details
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
                    SURAT PENGANTAR ROUTES - USER LEVEL
                    Requires: Full Profile (Auth + Email + KTP + User Details)
                    ======================================== */}
                
                {/* User Surat Pengantar Routes */}
                <Route 
                    path="/surat-pengantar" 
                    element={
                        <ProtectedRoute requiresKTP requiresUserDetails>
                            <SuratPengantarList />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/surat-pengantar/create" 
                    element={
                        <ProtectedRoute requiresKTP requiresUserDetails>
                            <CreateSuratPengantar />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/surat-pengantar/:id" 
                    element={
                        <ProtectedRoute requiresKTP requiresUserDetails>
                            <SuratPengantarDetail />
                        </ProtectedRoute>
                    } 
                />

                {/* ========================================
                    RT MANAGEMENT ROUTES
                    Requires: Full Profile + KETUA RT Role
                    ======================================== */}
                
                <Route 
                    path="/rt/surat-pengantar" 
                    element={
                        <RoleProtectedRoute allowedRoles={['KETUA RT']} requiresLocation={true}>
                            <RTDashboard />
                        </RoleProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/rt/surat-pengantar/:id" 
                    element={
                        <RoleProtectedRoute allowedRoles={['KETUA RT']} requiresLocation={true}>
                            <SuratPengantarDetail />
                        </RoleProtectedRoute>
                    } 
                />

                {/* ========================================
                    RW MANAGEMENT ROUTES
                    Requires: Full Profile + KETUA RW Role
                    ======================================== */}
                
                <Route 
                    path="/rw/surat-pengantar" 
                    element={
                        <RoleProtectedRoute allowedRoles={['KETUA RW']} requiresLocation={true}>
                            <RWDashboard />
                        </RoleProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/rw/surat-pengantar/:id" 
                    element={
                        <RoleProtectedRoute allowedRoles={['KETUA RW']} requiresLocation={true}>
                            <SuratPengantarDetail />
                        </RoleProtectedRoute>
                    } 
                />

                {/* ========================================
                    ADMIN ROUTES
                    Requires: Full Profile + ADMIN/SUPER ADMIN Role
                    ======================================== */}
                
                <Route 
                    path="/admin/surat-pengantar" 
                    element={
                        <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER ADMIN']}>
                            <AdminSuratPengantarDashboard />
                        </RoleProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/admin/surat-pengantar/statistics" 
                    element={
                        <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER ADMIN']}>
                            <AdminSuratPengantarDashboard />
                        </RoleProtectedRoute>
                    } 
                />

                {/* ========================================
                    MANAGEMENT ROUTES (for future features)
                    ======================================== */}
                
                {/* Role Management - Admin Only */}
                <Route 
                    path="/admin/roles" 
                    element={
                        <RoleProtectedRoute allowedRoles={['SUPER ADMIN', 'ADMIN']}>
                            <div>Role Management - Coming Soon</div>
                        </RoleProtectedRoute>
                    } 
                />

                {/* User Management - Admin Only */}
                <Route 
                    path="/admin/users" 
                    element={
                        <RoleProtectedRoute allowedRoles={['SUPER ADMIN', 'ADMIN']}>
                            <div>User Management - Coming Soon</div>
                        </RoleProtectedRoute>
                    } 
                />

                {/* Reports & Analytics - Admin/RT/RW */}
                <Route 
                    path="/reports" 
                    element={
                        <RoleProtectedRoute allowedRoles={['SUPER ADMIN', 'ADMIN', 'KETUA RT', 'KETUA RW']}>
                            <div>Reports & Analytics - Coming Soon</div>
                        </RoleProtectedRoute>
                    } 
                />

                {/* ========================================
                    PROFILE & SETTINGS ROUTES
                    ======================================== */}
                
                <Route 
                    path="/profile" 
                    element={
                        <ProtectedRoute requiresKTP requiresUserDetails>
                            <div>Profile Management - Coming Soon</div>
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/settings" 
                    element={
                        <ProtectedRoute requiresKTP requiresUserDetails>
                            <div>Settings - Coming Soon</div>
                        </ProtectedRoute>
                    } 
                />

                {/* ========================================
                    REDIRECT ROUTES
                    ======================================== */}
                
                {/* Auto-redirect based on completion status */}
                <Route 
                    path="/" 
                    element={
                        <ProtectedRoute>
                            <div>Redirecting...</div>
                        </ProtectedRoute>
                    } 
                />

                {/* ========================================
                    ERROR ROUTES
                    ======================================== */}
                
                {/* 404 - Catch all unmatched routes */}
                <Route 
                    path="/404" 
                    element={
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                                <p className="text-gray-600 mb-6">Halaman yang Anda cari tidak ditemukan</p>
                                <a href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    Kembali ke Dashboard
                                </a>
                            </div>
                        </div>
                    } 
                />

                {/* Unauthorized Access */}
                <Route 
                    path="/unauthorized" 
                    element={
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <h1 className="text-4xl font-bold text-red-600 mb-4">🚫</h1>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Akses Ditolak</h2>
                                <p className="text-gray-600 mb-6">Anda tidak memiliki izin untuk mengakses halaman ini</p>
                                <a href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    Kembali ke Dashboard
                                </a>
                            </div>
                        </div>
                    } 
                />

                {/* Catch all - redirect to 404 */}
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </div>
    );
}

export default App;