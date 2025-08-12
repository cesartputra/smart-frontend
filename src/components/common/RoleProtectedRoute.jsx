// src/components/common/RoleProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from './LoadingSpinner';

/**
 * Enhanced Role-based Protected Route Component
 * Checks user roles and permissions before allowing access
 */
const RoleProtectedRoute = ({ 
    children, 
    allowedRoles = [], 
    requiresLocation = false,
    fallbackPath = "/unauthorized"
}) => {
    const { isAuthenticated, user, getCompletionStatus } = useAuthStore();
    const location = useLocation();
    const [userRoles, setUserRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasPermission, setHasPermission] = useState(false);

    console.log('🛡️ RoleProtectedRoute check:', {
        isAuthenticated,
        user: user ? { email: user.email, id: user.id } : null,
        allowedRoles,
        requiresLocation,
        currentPath: location.pathname
    });

    // Check basic authentication first
    if (!isAuthenticated) {
        console.log('🚫 Not authenticated, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check completion status
    const completionStatus = getCompletionStatus();
    
    if (!completionStatus.isEmailVerified) {
        console.log('📧 Email not verified, redirecting to verify-email');
        return <Navigate to="/verify-email" replace />;
    }

    if (!completionStatus.hasCompletedKTP) {
        console.log('📝 KTP not completed, redirecting to complete-ktp');
        return <Navigate to="/complete-ktp" replace />;
    }

    if (!completionStatus.hasCompletedUserDetails) {
        console.log('👤 User details not completed, redirecting to complete-profile');
        return <Navigate to="/complete-profile" replace />;
    }

    // Fetch user roles
    useEffect(() => {
        const fetchUserRoles = async () => {
            try {
                setLoading(true);
                
                // Mock role fetching - replace with actual API call
                // This should call your role service to get user roles
                const response = await fetch('/api/user-roles/my-roles', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const roles = data.roles || [];
                    setUserRoles(roles);
                    
                    console.log('👥 User roles fetched:', roles);
                    
                    // Check if user has any of the allowed roles
                    const hasRole = allowedRoles.length === 0 || // No specific roles required
                        allowedRoles.some(allowedRole => 
                            roles.some(userRole => userRole.role_name === allowedRole)
                        );
                    
                    console.log('🔍 Permission check:', {
                        allowedRoles,
                        userRoles: roles.map(r => r.role_name),
                        hasRole
                    });
                    
                    setHasPermission(hasRole);
                } else {
                    console.error('❌ Failed to fetch user roles');
                    setHasPermission(false);
                }
            } catch (error) {
                console.error('❌ Error fetching user roles:', error);
                
                // Fallback: if no specific roles required, allow access
                if (allowedRoles.length === 0) {
                    setHasPermission(true);
                } else {
                    setHasPermission(false);
                }
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchUserRoles();
        } else {
            setLoading(false);
            setHasPermission(false);
        }
    }, [user?.id, allowedRoles]);

    // Location-based permission check
    useEffect(() => {
        if (!loading && hasPermission && requiresLocation) {
            // Additional location-based checks can be implemented here
            // For example, RT users can only access their own RT data
            console.log('📍 Location-based permission check required');
            
            // For now, we'll assume permission is valid
            // You can implement more granular location checks here
        }
    }, [loading, hasPermission, requiresLocation, userRoles]);

    // Show loading while checking permissions
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner text="Memeriksa izin akses..." />
            </div>
        );
    }

    // Check if user has required permissions
    if (!hasPermission) {
        console.log('🚫 Permission denied, redirecting to:', fallbackPath);
        return <Navigate to={fallbackPath} replace />;
    }

    // Special handling for specific roles and routes
    if (allowedRoles.includes('KETUA RT') && location.pathname.startsWith('/rt/')) {
        // Additional RT-specific checks can be added here
        const rtRole = userRoles.find(role => role.role_name === 'KETUA RT');
        if (!rtRole) {
            console.log('🚫 RT role required but not found');
            return <Navigate to="/unauthorized" replace />;
        }
        console.log('✅ RT access granted for RT:', rtRole.rt_id);
    }

    if (allowedRoles.includes('KETUA RW') && location.pathname.startsWith('/rw/')) {
        // Additional RW-specific checks can be added here
        const rwRole = userRoles.find(role => role.role_name === 'KETUA RW');
        if (!rwRole) {
            console.log('🚫 RW role required but not found');
            return <Navigate to="/unauthorized" replace />;
        }
        console.log('✅ RW access granted for RW:', rwRole.rw_id);
    }

    if (allowedRoles.some(role => ['ADMIN', 'SUPER ADMIN'].includes(role)) && 
        location.pathname.startsWith('/admin/')) {
        // Additional admin-specific checks can be added here
        const adminRole = userRoles.find(role => 
            ['ADMIN', 'SUPER ADMIN'].includes(role.role_name)
        );
        if (!adminRole) {
            console.log('🚫 Admin role required but not found');
            return <Navigate to="/unauthorized" replace />;
        }
        console.log('✅ Admin access granted:', adminRole.role_name);
    }

    console.log('✅ All permission checks passed, rendering component');
    
    return children;
};

export default RoleProtectedRoute;