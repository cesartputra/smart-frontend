// src/routes/managementRoutes.js - RT and RW management routes
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../components/common/RoleProtectedRoute';

// Management Components
import RTDashboard from '../pages/suratPengantar/RTDashboard';
import RWDashboard from '../pages/suratPengantar/RWDashboard';
import SuratPengantarDetail from '../pages/suratPengantar/SuratPengantarDetail';

const ManagementRoutes = () => {
    return (
        <>
            {/* ========================================
                RT MANAGEMENT ROUTES
                Requires: Full Profile + KETUA RT Role
                ======================================== */}
            
            {/* RT Surat Pengantar Dashboard */}
            <Route 
                path="/rt/surat-pengantar" 
                element={
                    <RoleProtectedRoute allowedRoles={['KETUA RT']} requiresLocation={true}>
                        <RTDashboard />
                    </RoleProtectedRoute>
                } 
            />
            
            {/* RT view of surat pengantar detail */}
            <Route 
                path="/rt/surat-pengantar/:id" 
                element={
                    <RoleProtectedRoute allowedRoles={['KETUA RT']} requiresLocation={true}>
                        <SuratPengantarDetail />
                    </RoleProtectedRoute>
                } 
            />

            {/* RT Reports */}
            <Route 
                path="/rt/reports" 
                element={
                    <RoleProtectedRoute allowedRoles={['KETUA RT']} requiresLocation={true}>
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-blue-600 mb-4">📋 Laporan RT</h1>
                                <p className="text-gray-600 mb-4">Laporan dan statistik RT Anda</p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-blue-800">RT Reports - Coming Soon...</p>
                                </div>
                            </div>
                        </div>
                    </RoleProtectedRoute>
                } 
            />

            {/* ========================================
                RW MANAGEMENT ROUTES
                Requires: Full Profile + KETUA RW Role
                ======================================== */}
            
            {/* RW Surat Pengantar Dashboard */}
            <Route 
                path="/rw/surat-pengantar" 
                element={
                    <RoleProtectedRoute allowedRoles={['KETUA RW']} requiresLocation={true}>
                        <RWDashboard />
                    </RoleProtectedRoute>
                } 
            />
            
            {/* RW view of surat pengantar detail */}
            <Route 
                path="/rw/surat-pengantar/:id" 
                element={
                    <RoleProtectedRoute allowedRoles={['KETUA RW']} requiresLocation={true}>
                        <SuratPengantarDetail />
                    </RoleProtectedRoute>
                } 
            />

            {/* RW Reports */}
            <Route 
                path="/rw/reports" 
                element={
                    <RoleProtectedRoute allowedRoles={['KETUA RW']} requiresLocation={true}>
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-purple-600 mb-4">📊 Laporan RW</h1>
                                <p className="text-gray-600 mb-4">Laporan dan statistik seluruh RT dalam RW</p>
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <p className="text-purple-800">RW Reports - Coming Soon...</p>
                                </div>
                            </div>
                        </div>
                    </RoleProtectedRoute>
                } 
            />

            {/* ========================================
                SHARED MANAGEMENT ROUTES (RT & RW)
                Requires: KETUA RT OR KETUA RW Role
                ======================================== */}
            
            {/* Combined Reports for RT/RW */}
            <Route 
                path="/reports" 
                element={
                    <RoleProtectedRoute allowedRoles={['KETUA RT', 'KETUA RW', 'ADMIN', 'SUPER ADMIN']}>
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">📈 Reports & Analytics</h1>
                                <p className="text-gray-600 mb-4">Laporan dan analisis berdasarkan peran Anda</p>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-gray-800">Multi-Role Reports - Coming Soon...</p>
                                </div>
                            </div>
                        </div>
                    </RoleProtectedRoute>
                } 
            />

            {/* Management Dashboard Overview */}
            <Route 
                path="/management" 
                element={
                    <RoleProtectedRoute allowedRoles={['KETUA RT', 'KETUA RW']}>
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">🏢 Management Overview</h1>
                                <p className="text-gray-600 mb-4">Dashboard pengelolaan RT/RW</p>
                                <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mt-6">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h3 className="text-blue-900 font-semibold mb-2">📋 Surat Pengantar</h3>
                                        <p className="text-blue-700 text-sm">Kelola persetujuan surat</p>
                                    </div>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <h3 className="text-green-900 font-semibold mb-2">📊 Laporan</h3>
                                        <p className="text-green-700 text-sm">Lihat statistik dan data</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </RoleProtectedRoute>
                } 
            />
        </>
    );
};

export default ManagementRoutes;