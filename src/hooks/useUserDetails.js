// src/hooks/useUserDetails.js - Enhanced with fetch functionality
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import userDetailsService from '../services/userDetailsService';
import useAuthStore from '../store/authStore';

export const useUserDetails = () => {
    const navigate = useNavigate();
    const { updateUser, getNextRequiredStep } = useAuthStore();

    // Get user details query - ENHANCED
    const userDetailsQuery = useQuery({
        queryKey: ['user-details'],
        queryFn: userDetailsService.getUserDetails,
        retry: 1, // Only retry once for 404 errors (normal for new users)
        retryOnMount: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        onError: (error) => {
            // Don't show error toast for 404 (user details not found)
            // This is normal for new users completing profile
            if (error.response?.status !== 404) {
                console.error('❌ Get user details error:', error);
            }
        }
    });

    // Create user details mutation
    const createUserDetailsMutation = useMutation({
        mutationFn: userDetailsService.createUserDetails,
        onSuccess: (data) => {
            console.log('✅ User details created successfully:', data);
            
            // Update user completion status
            updateUser({ hasCompletedUserDetails: true });
            
            toast.success('Profil berhasil dilengkapi!');
            
            // Invalidate query to refresh data
            userDetailsQuery.refetch();
            
            // Navigate to next required step (should be dashboard now)
            const nextStep = getNextRequiredStep();
            console.log('🎯 After user details completion, next step:', nextStep);
            navigate(nextStep);
        },
        onError: (error) => {
            console.error('❌ Create user details error:', error);
            const message = error.response?.data?.message || 'Gagal menyimpan profil';
            toast.error(message);
        },
    });

    // Update user details mutation - ENHANCED
    const updateUserDetailsMutation = useMutation({
        mutationFn: userDetailsService.updateUserDetails,
        onSuccess: (data) => {
            console.log('✅ User details updated successfully:', data);
            toast.success('Profil berhasil diperbarui!');
            
            // Invalidate and refetch user details query
            userDetailsQuery.refetch();
        },
        onError: (error) => {
            console.error('❌ Update user details error:', error);
            const message = error.response?.data?.message || 'Gagal memperbarui profil';
            toast.error(message);
        },
    });

    return {
        // Actions
        createUserDetails: createUserDetailsMutation.mutate,
        updateUserDetails: updateUserDetailsMutation.mutate,
        getUserDetails: userDetailsQuery.refetch,
        fetchUserDetails: userDetailsQuery.refetch, // Alias for consistency
        
        // Data
        userDetails: userDetailsQuery.data?.details || userDetailsQuery.data?.data || null,
        
        // Loading states
        isLoading: createUserDetailsMutation.isPending || updateUserDetailsMutation.isPending,
        isCreating: createUserDetailsMutation.isPending,
        isUpdating: updateUserDetailsMutation.isPending,
        isFetching: userDetailsQuery.isFetching,
        
        // Query info
        hasUserDetails: !!userDetailsQuery.data,
        isError: userDetailsQuery.isError,
        error: userDetailsQuery.error,
        
        // Query status
        isSuccess: userDetailsQuery.isSuccess,
        isInitialLoading: userDetailsQuery.isInitialLoading,
    };
};