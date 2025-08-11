// src/hooks/useUserDetails.js
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import userDetailsService from '../services/userDetailsService';
import useAuthStore from '../store/authStore';

export const useUserDetails = () => {
    const navigate = useNavigate();
    const { updateUser, getNextRequiredStep } = useAuthStore();

    // Create user details mutation
    const createUserDetailsMutation = useMutation({
        mutationFn: userDetailsService.createUserDetails,
        onSuccess: (data) => {
            console.log('✅ User details created successfully:', data);
            
            // Update user completion status
            updateUser({ hasCompletedUserDetails: true });
            
            toast.success('Profil berhasil dilengkapi!');
            
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

    // Update user details mutation
    const updateUserDetailsMutation = useMutation({
        mutationFn: userDetailsService.updateUserDetails,
        onSuccess: (data) => {
            console.log('✅ User details updated successfully:', data);
            toast.success('Profil berhasil diperbarui!');
            
            // Refetch user details query
            userDetailsQuery.refetch();
        },
        onError: (error) => {
            console.error('❌ Update user details error:', error);
            const message = error.response?.data?.message || 'Gagal memperbarui profil';
            toast.error(message);
        },
    });

    // Get user details query
    const userDetailsQuery = useQuery({
        queryKey: ['user-details'],
        queryFn: userDetailsService.getUserDetails,
        enabled: false, // Only fetch when explicitly called
        retry: 1, // Only retry once for 404 errors (normal for new users)
        retryOnMount: false,
        onError: (error) => {
            // Don't show error toast for 404 (user details not found)
            // This is normal for new users completing profile
            if (error.response?.status !== 404) {
                console.error('❌ Get user details error:', error);
            }
        }
    });

    return {
        // Actions
        createUserDetails: createUserDetailsMutation.mutate,
        updateUserDetails: updateUserDetailsMutation.mutate,
        getUserDetails: userDetailsQuery.refetch,
        
        // Data
        userDetails: userDetailsQuery.data?.details,
        
        // Loading states
        isLoading: createUserDetailsMutation.isPending || updateUserDetailsMutation.isPending,
        isCreating: createUserDetailsMutation.isPending,
        isUpdating: updateUserDetailsMutation.isPending,
        isFetching: userDetailsQuery.isFetching,
        
        // Query info
        hasUserDetails: !!userDetailsQuery.data?.details,
        fetchUserDetails: () => userDetailsQuery.refetch(),
    };
};