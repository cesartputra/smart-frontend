// src/hooks/useAuth.js - COMPLETE VERSION dengan semua functions
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import authService from '../services/authService';
import useAuthStore from '../store/authStore';

export const useAuth = () => {
    const navigate = useNavigate();
    const { setAuth, logout, user, isAuthenticated, getNextRequiredStep } = useAuthStore();

    // Sign Up Mutation - TAMBAH INI yang hilang
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

    // Sign In Mutation
    const signInMutation = useMutation({
        mutationFn: authService.signIn,
        onSuccess: (data) => {
        console.log('✅ Sign in success RAW data:', data);
        
        const { user, accessToken, refreshToken } = data.data;
        
        // IMPORTANT: Ensure user has correct verification status
        const updatedUser = {
            ...user,
            // Force set verified jika user berhasil login (backend sudah allow login = verified)
            isEmailVerified: true,
            // Preserve other completion status from backend response
            hasCompletedKTP: user.hasCompletedKTP || false,
            hasCompletedUserDetails: user.hasCompletedUserDetails || false,
        };
        
        console.log('🔄 Updated user object:', updatedUser);
        
        // Set authentication with updated user data
        setAuth(updatedUser, { accessToken, refreshToken });
        
        toast.success(data.message || 'Login berhasil!');
        
        // Determine next step based on updated user completion status  
        console.log('📊 Checking completion status...');
        console.log('- isEmailVerified:', updatedUser.isEmailVerified);
        console.log('- hasCompletedKTP:', updatedUser.hasCompletedKTP);
        console.log('- hasCompletedUserDetails:', updatedUser.hasCompletedUserDetails);
        
        // Manual next step logic (more reliable)
        let nextStep = '/dashboard';
        
        if (!updatedUser.isEmailVerified) {
            nextStep = '/verify-email';
        } else if (!updatedUser.hasCompletedKTP) {
            nextStep = '/complete-ktp';
        } else if (!updatedUser.hasCompletedUserDetails) {
            nextStep = '/complete-profile';
        }
        
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
        
        // Show success toast
        toast.success(data.message || 'Email berhasil diverifikasi!');
        
        // Check if response has expected structure
        if (data && data.success && data.data) {
            const { user, accessToken, refreshToken } = data.data;
            
            // Set authentication if tokens exist
            if (user && accessToken && refreshToken) {
            // Mark email as verified and update auth
            const updatedUser = { ...user, isEmailVerified: true };
            setAuth(updatedUser, { accessToken, refreshToken });
            console.log('✅ Auth set successfully after verification');
            
            // Navigate to next step (should be complete-ktp for new users)
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

    // Get Profile Query
    const profileQuery = useQuery({
        queryKey: ['profile'],
        queryFn: authService.getProfile,
        enabled: isAuthenticated,
        onSuccess: (data) => {
        console.log('✅ Profile fetched:', data.data.user);
        
        const profileUser = data.data.user;
        // Ensure verification status is correct
        const updatedUser = {
            ...profileUser,
            isEmailVerified: true, // If profile fetch succeeds, user is verified
        };
        
        setAuth(updatedUser);
        },
        onError: (error) => {
        console.error('❌ Profile fetch error:', error);
        logout();
        },
    });

    // Handle Logout - TAMBAH INI yang hilang
    const handleLogout = () => {
        logout();
        toast.success('Berhasil keluar');
        navigate('/login');
    };

    return {
        user,
        isAuthenticated,
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
        logout: handleLogout,
        isLoading: signUpMutation.isPending || signInMutation.isPending || verifyEmailMutation.isPending || resendVerificationMutation.isPending,
        profileLoading: profileQuery.isLoading,
    };
};