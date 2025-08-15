// src/routes/adminRoutes.js - Admin management routes
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../components/common/RoleProtectedRoute';

// Admin Components
import AdminSuratPengantarDashboard from '../pages/suratPengantar/AdminSuratPengantarDashboard';

const AdminRoutes = () => {
    return (
        <>
            {/* ========================================
                ADMIN SURAT PENGANTAR ROUTES
                Requires: Full Profile + ADMIN/SUPER ADMIN Role
                ======================================== */}
            
            {/* Admin Surat Pengantar Dashboard */}
            <Route 
                path="/admin/surat-pengantar" 
                element={
                    <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER ADMIN']}>
                        <AdminSuratPengantarDashboard />
                    </RoleProtectedRoute>
                } 
            />
            
            {/* Admin Surat Pengantar Statistics */}
            <Route 
                path="/admin/surat-pengantar/statistics" 
                element={
                    <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER ADMIN']}>
                        <AdminSuratPengantarDashboard />
                    </RoleProtectedRoute>
                } 
            />

            {/* ========================================
                USER MANAGEMENT ROUTES
                Requires: ADMIN/SUPER ADMIN Role
                ======================================== */}
            
            {/* User Management */}
            <Route 
                path="/admin/users" 
                element={
                    <RoleProtectedRoute allowedRoles={['SUPER ADMIN', 'ADMIN']}>
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">👥 User Management</h1>
                                <p className="text-gray-600 mb-4">Kelola pengguna sistem RT-RW</p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-blue-800">Coming Soon...</p>
                                </div>
                            </div>
                        </div>
                    </RoleProtectedRoute>
                } 
            />

            {/* ========================================
                ROLE MANAGEMENT ROUTES
                Requires: SUPER ADMIN Role Only
                ======================================== */}
            
            {/* Role Management */}
            <Route 
                path="/admin/roles" 
                element={
                    <RoleProtectedRoute allowedRoles={['SUPER ADMIN']}>
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">🛡️ Role Management</h1>
                                <p className="text-gray-600 mb-4">Kelola peran dan izin pengguna</p>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-yellow-800">Super Admin Only - Coming Soon...</p>
                                </div>
                            </div>
                        </div>
                    </RoleProtectedRoute>
                } 
            />

            {/* ========================================
                SYSTEM SETTINGS ROUTES
                Requires: SUPER ADMIN Role Only
                ======================================== */}
            
            {/* System Settings */}
            <Route 
                path="/admin/system" 
                element={
                    <RoleProtectedRoute allowedRoles={['SUPER ADMIN']}>
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">⚙️ System Settings</h1>
                                <p className="text-gray-600 mb-4">Pengaturan sistem dan konfigurasi</p>
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <p className="text-purple-800">System Configuration - Coming Soon...</p>
                                </div>
                            </div>
                        </div>
                    </RoleProtectedRoute>
                } 
            />

            {/* ========================================
                REPORTS & ANALYTICS ROUTES
                Requires: ADMIN/SUPER ADMIN Role
                ======================================== */}
            
            {/* Reports & Analytics */}
            <Route 
                path="/admin/reports" 
                element={
                    <RoleProtectedRoute allowedRoles={['SUPER ADMIN', 'ADMIN']}>
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">📊 Reports & Analytics</h1>
                                <p className="text-gray-600 mb-4">Laporan dan analisis sistem</p>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-green-800">Advanced Analytics - Coming Soon...</p>
                                </div>
                            </div>
                        </div>
                    </RoleProtectedRoute>
                } 
            />

            {/* ========================================
                ADMIN DETAIL VIEW
                Admin dapat melihat detail surat pengantar mana pun
                ======================================== */}
            
            {/* Admin view of any surat pengantar */}
            <Route 
                path="/admin/surat-pengantar/:id" 
                element={
                    <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER ADMIN']}>
                        <SuratPengantarDetail />
                    </RoleProtectedRoute>
                } 
            />
        </>
    );
};

export default AdminRoutes;