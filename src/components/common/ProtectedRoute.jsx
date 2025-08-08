// src/components/common/ProtectedRoute.jsx - Better completion checking
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const ProtectedRoute = ({ children, requiresKTP = false, requiresUserDetails = false }) => {
    const { isAuthenticated, user, getCompletionStatus, getNextRequiredStep } = useAuthStore();
    const location = useLocation();

    console.log('🛡️ ProtectedRoute check:', {
        isAuthenticated,
        user: user ? { ...user, hasCompletedKTP: user.hasCompletedKTP, hasCompletedUserDetails: user.hasCompletedUserDetails } : null,
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

    // Auto-redirect to next step if accessing a completed step
    if (!requiresKTP && !requiresUserDetails) {
        const nextStep = getNextRequiredStep();
        if (nextStep !== '/dashboard' && location.pathname !== nextStep) {
        console.log('🔄 Auto-redirecting to next required step:', nextStep);
        return <Navigate to={nextStep} replace />;
        }
    }

    return children;
};

export default ProtectedRoute;