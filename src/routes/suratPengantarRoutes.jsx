// src/routes/suratPengantarRoutes.js - User-level Surat Pengantar routes
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import RoleProtectedRoute from '../components/common/RoleProtectedRoute';

// Surat Pengantar Components
import SuratPengantarList from '../pages/suratPengantar/SuratPengantarList';
import CreateSuratPengantar from '../pages/suratPengantar/CreateSuratPengantar';
import SuratPengantarDetail from '../pages/suratPengantar/SuratPengantarDetail';

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
        </>
    );
};

export default SuratPengantarRoutes;