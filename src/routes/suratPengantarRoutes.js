// src/routes/suratPengantarRoutes.js - Surat Pengantar route configuration
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import RoleProtectedRoute from '../components/common/RoleProtectedRoute';

// Surat Pengantar Components
import SuratPengantarList from '../pages/suratPengantar/SuratPengantarList';
import CreateSuratPengantar from '../pages/suratPengantar/CreateSuratPengantar';
import SuratPengantarDetail from '../pages/suratPengantar/SuratPengantarDetail';
import RTDashboard from '../pages/suratPengantar/RTDashboard';
import RWDashboard from '../pages/suratPengantar/RWDashboard';
import AdminSuratPengantarDashboard from '../pages/suratPengantar/AdminSuratPengantarDashboard';

const SuratPengantarRoutes = () => {
    return (
        <>
            {/* ========================================
                USER SURAT PENGANTAR ROUTES
                Requires: Full Profile (Auth + Email + KTP + User Details)
                ======================================== */}
            
            {/* List all surat pengantar for user's family */}
            <Route 
                path="/surat-pengantar" 
                element={
                    <ProtectedRoute requiresKTP requiresUserDetails>
                        <SuratPengantarList />
                    </ProtectedRoute>
                } 
            />
            
            {/* Create new surat pengantar */}
            <Route 
                path="/surat-pengantar/create" 
                element={
                    <ProtectedRoute requiresKTP requiresUserDetails>
                        <CreateSuratPengantar />
                    </ProtectedRoute>
                } 
            />
            
            {/* View surat pengantar detail */}
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
            
            {/* RT Dashboard for managing approvals */}
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

            {/* ========================================
                RW MANAGEMENT ROUTES
                Requires: Full Profile + KETUA RW Role
                ======================================== */}
            
            {/* RW Dashboard for managing approvals */}
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

            {/* ========================================
                ADMIN ROUTES
                Requires: Full Profile + ADMIN/SUPER ADMIN Role
                ======================================== */}
            
            {/* Admin Dashboard with full statistics */}
            <Route 
                path="/admin/surat-pengantar" 
                element={
                    <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER ADMIN']}>
                        <AdminSuratPengantarDashboard />
                    </RoleProtectedRoute>
                } 
            />
            
            {/* Admin statistics page */}
            <Route 
                path="/admin/surat-pengantar/statistics" 
                element={
                    <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER ADMIN']}>
                        <AdminSuratPengantarDashboard />
                    </RoleProtectedRoute>
                } 
            />
            
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

export default SuratPengantarRoutes;