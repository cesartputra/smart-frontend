// src/components/common/RoleProtectedRoute.jsx - FIXED VERSION
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
    const [error, setError] = useState(null);

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
                setError(null);
                
                console.log('🔄 Fetching user roles...');
                
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user-roles/my-roles`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('📊 Role fetch response status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('📊 Raw role response:', data);
                    
                    // Handle different response structures
                    let roles = [];
                    if (data.success && data.data && data.data.roles) {
                        roles = data.data.roles;
                    } else if (data.roles) {
                        roles = data.roles;
                    } else if (Array.isArray(data)) {
                        roles = data;
                    }
                    
                    console.log('👥 Extracted user roles:', roles);
                    setUserRoles(roles);
                    
                    // Check if user has any of the allowed roles
                    if (allowedRoles.length === 0) {
                        // No specific roles required
                        console.log('✅ No specific roles required, access granted');
                        setHasPermission(true);
                    } else {
                        // Check specific roles
                        const hasRole = allowedRoles.some(allowedRole => {
                            const roleExists = roles.some(userRole => {
                                const match = userRole.role_name === allowedRole;
                                console.log(`🔍 Checking role "${userRole.role_name}" === "${allowedRole}": ${match}`);
                                return match;
                            });
                            return roleExists;
                        });
                        
                        console.log('🔍 Final permission check:', {
                            allowedRoles,
                            userRoleNames: roles.map(r => r.role_name),
                            hasRole
                        });
                        
                        setHasPermission(hasRole);
                    }
                } else {
                    console.error('❌ Failed to fetch user roles, status:', response.status);
                    const errorText = await response.text();
                    console.error('❌ Error response:', errorText);
                    
                    setError(`Failed to fetch roles: ${response.status}`);
                    setHasPermission(false);
                }
            } catch (error) {
                console.error('❌ Error fetching user roles:', error);
                setError(error.message);
                
                // Fallback: if no specific roles required, allow access
                if (allowedRoles.length === 0) {
                    console.log('🔄 Fallback: No roles required, granting access');
                    setHasPermission(true);
                } else {
                    console.log('🚫 Fallback: Roles required but fetch failed, denying access');
                    setHasPermission(false);
                }
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchUserRoles();
        } else {
            console.log('⚠️ No user ID found');
            setLoading(false);
            setHasPermission(false);
        }
    }, [user?.id, allowedRoles]);

    // Show loading while checking permissions
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner text="Memeriksa izin akses..." />
            </div>
        );
    }

    // Show error if there was a problem fetching roles
    if (error && !hasPermission) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Memuat Izin</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    // Check if user has required permissions
    if (!hasPermission) {
        console.log('🚫 Permission denied. Details:', {
            allowedRoles,
            userRoles: userRoles.map(r => r.role_name),
            currentPath: location.pathname
        });
        
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Akses Ditolak</h3>
                    <p className="text-gray-600 mb-4">
                        Anda tidak memiliki izin untuk mengakses halaman ini.
                    </p>
                    <div className="text-xs text-gray-500 mb-4">
                        <p>Diperlukan: {allowedRoles.join(', ')}</p>
                        <p>Anda memiliki: {userRoles.map(r => r.role_name).join(', ') || 'Tidak ada'}</p>
                    </div>
                    <div className="space-y-2">
                        <button
                            onClick={() => window.history.back()}
                            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                        >
                            Kembali
                        </button>
                        <a 
                            href="/dashboard" 
                            className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            Ke Dashboard
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Specific route validations
    const currentUserRoleNames = userRoles.map(r => r.role_name);

    // RT route validation
    if (location.pathname.startsWith('/rt/')) {
        const hasRTRole = currentUserRoleNames.includes('KETUA RT');
        if (!hasRTRole) {
            console.log('🚫 RT route requires KETUA RT role');
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                        <div className="text-orange-500 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0v-4a2 2 0 012-2h2a2 2 0 012 2v4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Akses RT Ditolak</h3>
                        <p className="text-gray-600 mb-4">
                            Halaman ini hanya dapat diakses oleh Ketua RT.
                        </p>
                        <a 
                            href="/dashboard" 
                            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            Kembali ke Dashboard
                        </a>
                    </div>
                </div>
            );
        }
        
        const rtRole = userRoles.find(role => role.role_name === 'KETUA RT');
        console.log('✅ RT access granted for RT:', rtRole?.rt_id, 'RT No:', rtRole?.rt_no);
    }

    // RW route validation
    if (location.pathname.startsWith('/rw/')) {
        const hasRWRole = currentUserRoleNames.includes('KETUA RW');
        if (!hasRWRole) {
            console.log('🚫 RW route requires KETUA RW role');
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                        <div className="text-purple-500 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l7-3 7 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Akses RW Ditolak</h3>
                        <p className="text-gray-600 mb-4">
                            Halaman ini hanya dapat diakses oleh Ketua RW.
                        </p>
                        <a 
                            href="/dashboard" 
                            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            Kembali ke Dashboard
                        </a>
                    </div>
                </div>
            );
        }
        
        const rwRole = userRoles.find(role => role.role_name === 'KETUA RW');
        console.log('✅ RW access granted for RW:', rwRole?.rw_id, 'RW No:', rwRole?.rw_no);
    }

    // Admin route validation
    if (location.pathname.startsWith('/admin/')) {
        const hasAdminRole = currentUserRoleNames.some(role => 
            ['ADMIN', 'SUPER ADMIN'].includes(role)
        );
        if (!hasAdminRole) {
            console.log('🚫 Admin route requires ADMIN or SUPER ADMIN role');
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                        <div className="text-red-500 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Akses Admin Ditolak</h3>
                        <p className="text-gray-600 mb-4">
                            Halaman ini hanya dapat diakses oleh Administrator.
                        </p>
                        <a 
                            href="/dashboard" 
                            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            Kembali ke Dashboard
                        </a>
                    </div>
                </div>
            );
        }
        
        const adminRole = userRoles.find(role => 
            ['ADMIN', 'SUPER ADMIN'].includes(role.role_name)
        );
        console.log('✅ Admin access granted:', adminRole?.role_name);
    }

    console.log('✅ All permission checks passed, rendering component');
    
    return children;
};

export default RoleProtectedRoute;