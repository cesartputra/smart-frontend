// src/hooks/useUserKTP.js - Update completion tracking
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ktpService from '../services/userKtpService';
import useAuthStore from '../store/authStore';

export const useUserKtp = () => {
    const navigate = useNavigate();
    const { updateUser, getNextRequiredStep } = useAuthStore();

    // Create/Claim KTP Mutation
    const createKTPMutation = useMutation({
        mutationFn: ktpService.createKTP,
        onSuccess: (data) => {
        console.log('✅ KTP creation/claim success:', data);
        
        // Update user completion status
        updateUser({ hasCompletedKTP: true });
        
        // Show appropriate message
        const message = data.data?.claimed ? 
            'Berhasil mengklaim data KTP yang sudah ada!' : 
            'Data KTP berhasil disimpan!';
        
        toast.success(message);
        
        // Navigate to next required step
        const nextStep = getNextRequiredStep();
        console.log('🎯 After KTP completion, next step:', nextStep);
        navigate(nextStep);
        },
        onError: (error) => {
        console.error('❌ KTP creation/claim error:', error);
        const message = error.response?.data?.message || 'Gagal menyimpan data KTP';
        toast.error(message);
        },
    });

    // Check NIK claimability
    const checkNikMutation = useMutation({
        mutationFn: ktpService.checkNikClaimability,
        onError: (error) => {
        console.error('❌ Check NIK error:', error);
        },
    });

    // Get KTP Query
    const ktpQuery = useQuery({
        queryKey: ['ktp'],
        queryFn: ktpService.getKTP,
        enabled: false, // Only fetch when needed
    });

    // Get unclaimed members
    const unclaimedQuery = useQuery({
        queryKey: ['unclaimed-members'],
        queryFn: ktpService.getUnclaimedMembers,
        enabled: false,
    });

    return {
        createKTP: createKTPMutation.mutate,
        checkNikClaimability: checkNikMutation.mutate,
        isLoading: createKTPMutation.isPending,
        isCheckingNik: checkNikMutation.isPending,
        ktpData: ktpQuery.data,
        unclaimedMembers: unclaimedQuery.data,
        checkNikResult: checkNikMutation.data,
        fetchKTP: ktpQuery.refetch,
        fetchUnclaimedMembers: unclaimedQuery.refetch,
    };
};