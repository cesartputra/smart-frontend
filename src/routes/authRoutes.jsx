// src/routes/authRoutes.js - Authentication and Profile routes
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Auth Components
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyEmail from '../pages/auth/VerifyEmail';
import CompleteKTP from '../pages/ktp/CompleteKTP';
import CompleteProfile from '../pages/profile/CompleteProfile';

const AuthRoutes = () => {
    return (
        <>
            {/* ========================================
                PUBLIC AUTH ROUTES (No Authentication Required)
                ======================================== */}
            
            {/* Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Register */}
            <Route path="/register" element={<Register />} />
            
            {/* Email verification - accessible without full auth */}
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* ========================================
                PROFILE COMPLETION ROUTES
                Requires: Authentication + Email Verification
                ======================================== */}
            
            {/* KTP Completion */}
            <Route 
                path="/complete-ktp" 
                element={
                    <ProtectedRoute>
                        <CompleteKTP />
                    </ProtectedRoute>
                } 
            />
            
            {/* Profile Completion */}
            <Route 
                path="/complete-profile" 
                element={
                    <ProtectedRoute requiresKTP>
                        <CompleteProfile />
                    </ProtectedRoute>
                } 
            />

            {/* ========================================
                PROFILE & SETTINGS ROUTES
                Requires: Full Profile (Auth + Email + KTP + User Details)
                ======================================== */}
            
            {/* Profile Management */}
            <Route 
                path="/profile" 
                element={
                    <ProtectedRoute requiresKTP requiresUserDetails>
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Management</h1>
                                <p className="text-gray-600">Coming Soon...</p>
                            </div>
                        </div>
                    </ProtectedRoute>
                } 
            />
            
            {/* Settings */}
            <Route 
                path="/settings" 
                element={
                    <ProtectedRoute requiresKTP requiresUserDetails>
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
                                <p className="text-gray-600">Coming Soon...</p>
                            </div>
                        </div>
                    </ProtectedRoute>
                } 
            />
        </>
    );
};

export default AuthRoutes;