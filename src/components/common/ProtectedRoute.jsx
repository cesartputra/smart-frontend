// src/components/common/ProtectedRoute.jsx - Enhanced dengan debugging
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const ProtectedRoute = ({ children, requiresKTP = false, requiresUserDetails = false }) => {
    const { isAuthenticated, user, getCompletionStatus, getNextRequiredStep } = useAuthStore();
    const location = useLocation();

    console.log('🛡️ ProtectedRoute check:', {
        isAuthenticated,
        user: user ? { 
            id: user.id,
            email: user.email,
            hasCompletedKTP: user.hasCompletedKTP, 
            hasCompletedUserDetails: user.hasCompletedUserDetails 
        } : null,
        requiresKTP,
        requiresUserDetails,
        currentPath: location.pathname
    });

    // Check if user is authenticated
    if (!isAuthenticated) {
        console.log('🚫 Not authenticated, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const completionStatus = getCompletionStatus();
    console.log('📊 Completion status:', completionStatus);

    // If email not verified, redirect to verify email
    if (!completionStatus.isEmailVerified) {
        console.log('📧 Email not verified, redirecting to verify-email');
        return <Navigate to="/verify-email" replace />;
    }

    // If KTP required but not completed
    if (requiresKTP && !completionStatus.hasCompletedKTP) {
        console.log('📝 KTP required but not completed, redirecting to complete-ktp');
        return <Navigate to="/complete-ktp" replace />;
    }

    // If user details required but not completed
    if (requiresUserDetails && !completionStatus.hasCompletedUserDetails) {
        console.log('👤 User details required but not completed, redirecting to complete-profile');
        return <Navigate to="/complete-profile" replace />;
    }

    // Auto-redirect to next step if accessing a completed step (only for root path)
    if (!requiresKTP && !requiresUserDetails && location.pathname === '/') {
        const nextStep = getNextRequiredStep();
        if (nextStep !== '/dashboard') {
            console.log('🔄 Auto-redirecting from root to next required step:', nextStep);
            return <Navigate to={nextStep} replace />;
        }
    }

    // Special handling untuk dashboard dan routes lainnya
    const allowedPaths = [
        '/dashboard',
        '/surat-pengantar',
        '/rt/surat-pengantar',
        '/rw/surat-pengantar',
        '/admin/',
        '/profile',
        '/settings'
    ];

    const isAllowedPath = allowedPaths.some(path => 
        location.pathname === path || location.pathname.startsWith(path)
    );

    if (!isAllowedPath && location.pathname !== '/') {
        console.log('⚠️ Unknown path, checking completion status for:', location.pathname);
        
        // Jika semua requirement terpenuhi, lanjutkan
        if (completionStatus.isEmailVerified && 
            completionStatus.hasCompletedKTP && 
            completionStatus.hasCompletedUserDetails) {
            console.log('✅ All requirements met, allowing access to:', location.pathname);
            return children;
        }
        
        // Jika belum, redirect ke next step
        const nextStep = getNextRequiredStep();
        if (nextStep !== location.pathname) {
            console.log('🔄 Redirecting to next required step:', nextStep);
            return <Navigate to={nextStep} replace />;
        }
    }

    console.log('✅ ProtectedRoute: All checks passed for:', location.pathname);
    return children;
};

export default ProtectedRoute;