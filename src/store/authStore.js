// src/store/authStore.js - Update dengan logic yang lebih robust
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set, get) => ({
        user: null,
        isAuthenticated: false,
        
        setAuth: (user, tokens) => {
            console.log('🔐 setAuth called with user:', user);
            if (tokens) {
            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);
            }
            set({ user, isAuthenticated: true });
        },
        
        logout: () => {
            console.log('🚪 logout called - clearing all data');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('auth-storage');
            set({ user: null, isAuthenticated: false });
        },
        
        updateUser: (userData) => {
            console.log('👤 updateUser called with:', userData);
            const currentUser = get().user;
            const updatedUser = { ...currentUser, ...userData };
            set({ user: updatedUser });
        },
        
        getToken: () => {
            return localStorage.getItem('accessToken');
        },

        getCompletionStatus: () => {
            const user = get().user;
            return {
            isEmailVerified: user?.isEmailVerified || false,
            hasCompletedKTP: user?.hasCompletedKTP || false,
            hasCompletedUserDetails: user?.hasCompletedUserDetails || false,
            };
        },

        getNextRequiredStep: () => {
            const user = get().user;
            
            console.log('🎯 getNextRequiredStep - user state:', {
            isEmailVerified: user?.isEmailVerified,
            hasCompletedKTP: user?.hasCompletedKTP,
            hasCompletedUserDetails: user?.hasCompletedUserDetails
            });
            
            // More explicit logic
            if (!user?.isEmailVerified) {
            console.log('📧 Email not verified → /verify-email');
            return '/verify-email';
            }
            
            if (!user?.hasCompletedKTP) {
            console.log('📝 KTP not completed → /complete-ktp');
            return '/complete-ktp';
            }
            
            if (!user?.hasCompletedUserDetails) {
            console.log('👤 Profile not completed → /complete-profile');
            return '/complete-profile';
            }
            
            console.log('✅ All completed → /dashboard');
            return '/dashboard';
        }
        }),
        {
        name: 'auth-storage',
        partialize: (state) => ({ 
            user: state.user, 
            isAuthenticated: state.isAuthenticated 
        }),
        }
    )
);

export default useAuthStore;