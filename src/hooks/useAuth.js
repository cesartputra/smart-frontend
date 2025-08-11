// src/hooks/useAuth.js - Enhanced with logout functionality
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

    // Sign In Mutation - Enhanced with session setup
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
            
            toast.success(data.message || 'Login berhasil!');
            
            // Navigate to next step
            const nextStep = getNextRequiredStep();
            console.log('🎯 Determined next step:', nextStep);
            navigate(nextStep);
        },
        onError: (error) => {
            console.error('❌ Sign in error:', error);
            const message = error.response?.data?.message || 'Gagal masuk. Periksa email dan password Anda.';
            toast.error(message);
        },
    });

    // Verify Email Mutation
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
                    
                    const nextStep = getNextRequiredStep();
                    console.log('🎯 After verification, next step:', nextStep);
                    navigate(nextStep);
                }
            }
        },
        onError: (error) => {
            console.error('❌ Email verification ERROR:', error);
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
            const message = error.response?.data?.message || 'Gagal mengirim ulang verifikasi';
            toast.error(message);
        },
    });

    // Enhanced Logout Mutation
    const logoutMutation = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return;
            
            return await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        },
        onSuccess: () => {
            console.log('✅ Backend logout successful');
        },
        onError: (error) => {
            console.error('❌ Backend logout failed:', error);
            // Continue with frontend logout even if backend fails
        },
        onSettled: () => {
            // Always clear frontend state regardless of backend response
            authStoreLogout(true);
        }
    });

    // Logout All Devices Mutation
    const logoutAllMutation = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return;
            
            return await fetch('/api/auth/logout-all', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        },
        onSuccess: () => {
            console.log('✅ Logout all devices successful');
            toast.success('Berhasil keluar dari semua perangkat');
        },
        onError: (error) => {
            console.error('❌ Logout all devices failed:', error);
            toast.error('Gagal keluar dari semua perangkat');
        },
        onSettled: () => {
            // Always clear frontend state
            authStoreLogout(true);
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
            toast.error('Sesi berakhir. Silakan login kembali.');
        }
    });

    // Get Profile Query
    const profileQuery = useQuery({
        queryKey: ['profile'],
        queryFn: authService.getProfile,
        enabled: isAuthenticated,
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
            authStoreLogout(false);
        },
    });

    // Handle Manual Logout
    const handleLogout = () => {
        logoutMutation.mutate();
    };

    // Handle Logout All Devices
    const handleLogoutAll = () => {
        logoutAllMutation.mutate();
    };

    // Handle Session Extension
    const handleExtendSession = async () => {
        try {
            const success = await extendSession();
            if (!success) {
                toast.error('Gagal memperpanjang sesi');
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

    return {
        user,
        isAuthenticated,
        sessionInfo: getSessionInfo(),
        
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
        
        // Loading states
        isLoading: signUpMutation.isPending || signInMutation.isPending || 
                    verifyEmailMutation.isPending || resendVerificationMutation.isPending,
        isLoggingOut: logoutMutation.isPending || logoutAllMutation.isPending,
        profileLoading: profileQuery.isLoading,
    };
};