// src/hooks/useAuth.js - Enhanced with download redirect functionality
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import authService from '../services/authService';
import useAuthStore from '../store/authStore';

export const useAuth = () => {
    const navigate = useNavigate();
    const { 
        setAuth, 
        logout: authStoreLogout, 
        user, 
        isAuthenticated, 
        getNextRequiredStep,
        extendSession,
        getTimeUntilExpiry
    } = useAuthStore();

    // Helper function untuk handle post-login redirects
    const handlePostLoginRedirect = (user) => {
        console.log('🔄 Post-login redirect handler called');
        
        // Check for download redirect dari intended URL (priority 1)
        const intendedUrl = localStorage.getItem('intendedUrl');
        
        if (intendedUrl && intendedUrl.includes('/download')) {
            console.log('🎯 Found intended download URL:', intendedUrl);
            localStorage.removeItem('intendedUrl');
            
            const match = intendedUrl.match(/\/surat-pengantar\/([^\/]+)\/download/);
            if (match && match[1]) {
                console.log('✅ Redirecting to detail with auto download:', match[1]);
                navigate(`/surat-pengantar/${match[1]}?autoDownload=true`, { replace: true });
                return true;
            }
        }
        
        // Check for download redirect dari URL params (priority 2)
        const urlParams = new URLSearchParams(window.location.search);
        const isDownloadRedirect = urlParams.get('redirect') === 'download';
        const downloadId = urlParams.get('id');
        
        if (isDownloadRedirect && downloadId) {
            console.log('🎯 Found URL param download redirect:', downloadId);
            
            // Clean up URL params
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
            
            navigate(`/surat-pengantar/${downloadId}?autoDownload=true`, { replace: true });
            return true;
        }
        
        // Normal redirect flow (priority 3)
        const nextStep = getNextRequiredStep();
        console.log('🎯 Normal redirect to next step:', nextStep);
        navigate(nextStep, { replace: true });
        return false;
    };

    // Sign Up Mutation
    const signUpMutation = useMutation({
        mutationFn: authService.signUp,
        onSuccess: (data) => {
            console.log('✅ Sign up success:', data);
            toast.success(data.message || 'Pendaftaran berhasil!');
            navigate('/verify-email', { 
                state: { email: data.data?.email } 
            });
        },
        onError: (error) => {
            console.error('❌ Sign up error:', error);
            const message = error.response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.';
            toast.error(message);
        },
    });

    // Sign In Mutation - Enhanced with download redirect support
    const signInMutation = useMutation({
        mutationFn: authService.signIn,
        onSuccess: (data) => {
            console.log('✅ Sign in success RAW data:', data);
            
            const { user, accessToken, refreshToken } = data.data;
            
            // Set user with verified status
            const updatedUser = {
                ...user,
                isEmailVerified: true,
                hasCompletedKTP: user.hasCompletedKTP || false,
                hasCompletedUserDetails: user.hasCompletedUserDetails || false,
            };
            
            console.log('🔄 Updated user object:', updatedUser);
            
            // Set authentication with session management
            setAuth(updatedUser, { accessToken, refreshToken });
            
            // Show success message
            const isDownloadFlow = window.location.search.includes('redirect=download') || 
                                  localStorage.getItem('intendedUrl')?.includes('/download');
            
            if (isDownloadFlow) {
                toast.success('Login berhasil! Mempersiapkan download...', { duration: 2000 });
            } else {
                toast.success(data.message || 'Login berhasil!');
            }
            
            // Handle redirect with download flow support
            const wasDownloadRedirect = handlePostLoginRedirect(updatedUser);
            
            if (wasDownloadRedirect) {
                console.log('🎯 Download redirect completed');
            }
        },
        onError: (error) => {
            console.error('❌ Sign in error:', error);
            
            // Enhanced error handling
            let message = 'Gagal masuk. Periksa email dan password Anda.';
            
            if (error.response?.status === 401) {
                message = 'Email atau password salah';
            } else if (error.response?.status === 403) {
                message = 'Akun Anda belum diverifikasi atau diblokir';
            } else if (error.response?.status === 429) {
                message = 'Terlalu banyak percobaan login. Coba lagi nanti.';
            } else if (error.response?.data?.message) {
                message = error.response.data.message;
            }
            
            toast.error(message);
        },
    });

    // Verify Email Mutation - Enhanced with download redirect support
    const verifyEmailMutation = useMutation({
        mutationFn: authService.verifyEmail,
        onSuccess: (data) => {
            console.log('✅ Email verification success:', data);
            
            toast.success(data.message || 'Email berhasil diverifikasi!');
            
            if (data && data.success && data.data) {
                const { user, accessToken, refreshToken } = data.data;
                
                if (user && accessToken && refreshToken) {
                    const updatedUser = { ...user, isEmailVerified: true };
                    setAuth(updatedUser, { accessToken, refreshToken });
                    console.log('✅ Auth set successfully after verification');
                    
                    // Handle redirect after verification
                    const wasDownloadRedirect = handlePostLoginRedirect(updatedUser);
                    
                    if (!wasDownloadRedirect) {
                        const nextStep = getNextRequiredStep();
                        console.log('🎯 After verification, next step:', nextStep);
                        navigate(nextStep);
                    }
                }
            }
        },
        onError: (error) => {
            console.error('❌ Email verification ERROR:', error);
            
            let message = 'Verifikasi email gagal';
            
            if (error.response?.status === 400) {
                message = 'Token verifikasi tidak valid atau sudah kedaluwarsa';
            } else if (error.response?.status === 404) {
                message = 'Token verifikasi tidak ditemukan';
            } else if (error.response?.data?.message) {
                message = error.response.data.message;
            }
            
            toast.error(message);
            throw error;
        },
    });

    // Resend Verification Mutation
    const resendVerificationMutation = useMutation({
        mutationFn: authService.resendVerification,
        onSuccess: (data) => {
            console.log('✅ Resend verification success:', data);
            toast.success(data.message || 'Email verifikasi telah dikirim ulang');
        },
        onError: (error) => {
            console.error('❌ Resend verification error:', error);
            
            let message = 'Gagal mengirim ulang verifikasi';
            
            if (error.response?.status === 429) {
                message = 'Harap tunggu sebelum meminta verifikasi ulang';
            } else if (error.response?.data?.message) {
                message = error.response.data.message;
            }
            
            toast.error(message);
        },
    });

    // Enhanced Logout Mutation
    const logoutMutation = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return;
            
            try {
                await authService.logout();
                console.log('✅ Backend logout successful');
            } catch (error) {
                console.error('❌ Backend logout failed:', error);
                // Continue with frontend logout even if backend fails
            }
        },
        onSuccess: () => {
            console.log('✅ Logout process completed');
        },
        onError: (error) => {
            console.error('❌ Logout process failed:', error);
            // Continue with frontend logout even if backend fails
        },
        onSettled: () => {
            // Always clear frontend state regardless of backend response
            authStoreLogout(true);
            
            // Clear any pending download redirects
            localStorage.removeItem('intendedUrl');
            
            // Navigate to home page
            navigate('/', { replace: true });
            
            toast.success('Berhasil keluar');
        }
    });

    // Logout All Devices Mutation
    const logoutAllMutation = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return;
            
            try {
                await authService.logoutAll();
                console.log('✅ Logout all devices successful');
            } catch (error) {
                console.error('❌ Logout all devices failed:', error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success('Berhasil keluar dari semua perangkat');
        },
        onError: (error) => {
            console.error('❌ Logout all devices failed:', error);
            
            let message = 'Gagal keluar dari semua perangkat';
            if (error.response?.data?.message) {
                message = error.response.data.message;
            }
            
            toast.error(message);
        },
        onSettled: () => {
            // Always clear frontend state
            authStoreLogout(true);
            
            // Clear any pending download redirects
            localStorage.removeItem('intendedUrl');
            
            // Navigate to home page
            navigate('/', { replace: true });
        }
    });

    // Refresh Token Mutation
    const refreshTokenMutation = useMutation({
        mutationFn: authService.refreshToken,
        onSuccess: (data) => {
            console.log('✅ Token refresh success:', data);
            
            // Update auth store with new tokens
            setAuth(data.user, {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken
            });
        },
        onError: (error) => {
            console.error('❌ Token refresh failed:', error);
            
            // Force logout if refresh fails
            authStoreLogout(false);
            
            // Clear any pending download redirects
            localStorage.removeItem('intendedUrl');
            
            toast.error('Sesi berakhir. Silakan login kembali.');
            navigate('/login', { replace: true });
        }
    });

    // Get Profile Query
    const profileQuery = useQuery({
        queryKey: ['profile'],
        queryFn: authService.getProfile,
        enabled: isAuthenticated,
        retry: 1,
        onSuccess: (data) => {
            console.log('✅ Profile fetched:', data.data.user);
            
            const profileUser = data.data.user;
            const updatedUser = {
                ...profileUser,
                isEmailVerified: true,
            };
            
            setAuth(updatedUser);
        },
        onError: (error) => {
            console.error('❌ Profile fetch error:', error);
            
            // Only logout if it's a 401/403 error (auth related)
            if (error.response?.status === 401 || error.response?.status === 403) {
                authStoreLogout(false);
                localStorage.removeItem('intendedUrl');
                navigate('/login', { replace: true });
            }
        },
    });

    // Handle Manual Logout
    const handleLogout = () => {
        console.log('🚪 Manual logout triggered');
        logoutMutation.mutate();
    };

    // Handle Logout All Devices
    const handleLogoutAll = () => {
        console.log('🚪 Logout all devices triggered');
        logoutAllMutation.mutate();
    };

    // Handle Session Extension
    const handleExtendSession = async () => {
        try {
            console.log('⏰ Extending session...');
            const success = await extendSession();
            if (!success) {
                toast.error('Gagal memperpanjang sesi');
            } else {
                toast.success('Sesi berhasil diperpanjang', { duration: 2000 });
            }
            return success;
        } catch (error) {
            console.error('❌ Session extension failed:', error);
            toast.error('Gagal memperpanjang sesi');
            return false;
        }
    };

    // Get session info
    const getSessionInfo = () => {
        const timeLeft = getTimeUntilExpiry();
        return {
            timeUntilExpiry: timeLeft,
            isExpiringSoon: timeLeft !== null && timeLeft <= 5,
            isExpired: timeLeft !== null && timeLeft <= 0
        };
    };

    // Check if user has download redirect pending
    const hasPendingDownload = () => {
        const intendedUrl = localStorage.getItem('intendedUrl');
        const urlParams = new URLSearchParams(window.location.search);
        const isDownloadRedirect = urlParams.get('redirect') === 'download';
        
        return (intendedUrl && intendedUrl.includes('/download')) || isDownloadRedirect;
    };

    // Manual redirect handler for special cases
    const handleManualRedirect = (path, options = {}) => {
        console.log('🔄 Manual redirect to:', path);
        navigate(path, { replace: true, ...options });
    };

    return {
        user,
        isAuthenticated,
        sessionInfo: getSessionInfo(),
        hasPendingDownload: hasPendingDownload(),
        
        // Auth actions
        signUp: signUpMutation.mutate,
        signIn: signInMutation.mutate,
        verifyEmail: async (token) => {
            console.log('🚀 verifyEmail called from component with token:', token);
            try {
                const result = await verifyEmailMutation.mutateAsync(token);
                console.log('✅ verifyEmail completed successfully:', result);
                return result;
            } catch (error) {
                console.error('❌ verifyEmail failed:', error);
                throw error;
            }
        },
        resendVerification: resendVerificationMutation.mutate,
        
        // Logout actions
        logout: handleLogout,
        logoutAll: handleLogoutAll,
        
        // Session management
        extendSession: handleExtendSession,
        refreshToken: refreshTokenMutation.mutate,
        
        // Navigation helpers
        redirectTo: handleManualRedirect,
        handlePostLoginRedirect,
        
        // Loading states
        isLoading: signUpMutation.isPending || signInMutation.isPending || 
                    verifyEmailMutation.isPending || resendVerificationMutation.isPending,
        isLoggingOut: logoutMutation.isPending || logoutAllMutation.isPending,
        profileLoading: profileQuery.isLoading,
        isRefreshingToken: refreshTokenMutation.isPending,
        
        // Error states
        signUpError: signUpMutation.error,
        signInError: signInMutation.error,
        verifyEmailError: verifyEmailMutation.error,
    };
};