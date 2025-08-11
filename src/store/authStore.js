// src/store/authStore.js - Enhanced with auto logout
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const TOKEN_EXPIRY_MINUTES = 15;
const WARNING_MINUTES = 2; // Show warning 2 minutes before expiry
const CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            tokenExpiryTime: null,
            autoLogoutTimer: null,
            warningTimer: null,
            showExpiryWarning: false,
            
            setAuth: (user, tokens) => {
                console.log('🔐 setAuth called with user:', user);
                
                // Clear any existing timers
                const state = get();
                if (state.autoLogoutTimer) {
                    clearTimeout(state.autoLogoutTimer);
                }
                if (state.warningTimer) {
                    clearTimeout(state.warningTimer);
                }
                
                if (tokens) {
                    localStorage.setItem('accessToken', tokens.accessToken);
                    localStorage.setItem('refreshToken', tokens.refreshToken);
                    
                    // Calculate expiry time (15 minutes from now)
                    const expiryTime = Date.now() + (TOKEN_EXPIRY_MINUTES * 60 * 1000);
                    localStorage.setItem('tokenExpiryTime', expiryTime.toString());
                    
                    // Set up auto logout timer
                    const autoLogoutTimer = setTimeout(() => {
                        console.log('⏰ Auto logout triggered - token expired');
                        get().handleAutoLogout();
                    }, TOKEN_EXPIRY_MINUTES * 60 * 1000);
                    
                    // Set up warning timer (2 minutes before expiry)
                    const warningTimer = setTimeout(() => {
                        console.log('⚠️ Token expiry warning triggered');
                        get().showExpiryWarning();
                    }, (TOKEN_EXPIRY_MINUTES - WARNING_MINUTES) * 60 * 1000);
                    
                    set({ 
                        user, 
                        isAuthenticated: true,
                        tokenExpiryTime: expiryTime,
                        autoLogoutTimer,
                        warningTimer,
                        showExpiryWarning: false
                    });
                } else {
                    set({ user, isAuthenticated: true });
                }
            },
            
            logout: async (showMessage = true) => {
                console.log('🚪 Logout called');
                
                const state = get();
                
                // Clear timers
                if (state.autoLogoutTimer) {
                    clearTimeout(state.autoLogoutTimer);
                }
                if (state.warningTimer) {
                    clearTimeout(state.warningTimer);
                }
                
                // Call backend logout API if token exists
                const token = localStorage.getItem('accessToken');
                if (token) {
                    try {
                        await fetch('/api/auth/logout', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        console.log('✅ Backend logout successful');
                    } catch (error) {
                        console.error('❌ Backend logout failed:', error);
                        // Continue with frontend logout even if backend fails
                    }
                }
                
                // Clear all storage
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('tokenExpiryTime');
                localStorage.removeItem('auth-storage');
                
                set({ 
                    user: null, 
                    isAuthenticated: false,
                    tokenExpiryTime: null,
                    autoLogoutTimer: null,
                    warningTimer: null,
                    showExpiryWarning: false
                });
                
                if (showMessage) {
                    // Show toast notification
                    if (window.toast) {
                        window.toast.success('Berhasil keluar');
                    }
                }
                
                // Redirect to login
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            },
            
            handleAutoLogout: () => {
                console.log('🔄 Handling auto logout');
                get().logout(false); // Don't show success message for auto logout
                
                // Show auto logout message
                if (window.toast) {
                    window.toast.error('Sesi Anda telah berakhir. Silakan login kembali.', {
                        duration: 5000
                    });
                }
            },
            
            showExpiryWarning: () => {
                console.log('⚠️ Showing expiry warning');
                set({ showExpiryWarning: true });
                
                // Show warning toast
                if (window.toast) {
                    window.toast('Sesi Anda akan berakhir dalam 2 menit', {
                        duration: 10000,
                        style: {
                            background: '#f59e0b',
                            color: '#fff',
                        },
                    });
                }
            },
            
            hideExpiryWarning: () => {
                set({ showExpiryWarning: false });
            },
            
            extendSession: async () => {
                console.log('🔄 Attempting to extend session');
                
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    console.log('❌ No refresh token available');
                    get().handleAutoLogout();
                    return false;
                }
                
                try {
                    const response = await fetch('/api/auth/refresh-token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ refreshToken })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('✅ Session extended successfully');
                        
                        // Update tokens and reset timers
                        get().setAuth(data.data.user, {
                            accessToken: data.data.accessToken,
                            refreshToken: data.data.refreshToken
                        });
                        
                        get().hideExpiryWarning();
                        
                        if (window.toast) {
                            window.toast.success('Sesi berhasil diperpanjang');
                        }
                        
                        return true;
                    } else {
                        console.log('❌ Failed to extend session');
                        get().handleAutoLogout();
                        return false;
                    }
                } catch (error) {
                    console.error('❌ Error extending session:', error);
                    get().handleAutoLogout();
                    return false;
                }
            },
            
            initializeAuth: () => {
                console.log('🚀 Initializing auth state');
                
                const tokenExpiryTime = localStorage.getItem('tokenExpiryTime');
                const accessToken = localStorage.getItem('accessToken');
                
                if (tokenExpiryTime && accessToken) {
                    const expiryTime = parseInt(tokenExpiryTime);
                    const currentTime = Date.now();
                    
                    console.log('⏰ Token expiry check:', {
                        expiryTime: new Date(expiryTime).toLocaleTimeString(),
                        currentTime: new Date(currentTime).toLocaleTimeString(),
                        timeLeft: Math.round((expiryTime - currentTime) / 1000 / 60) + ' minutes'
                    });
                    
                    if (currentTime >= expiryTime) {
                        console.log('⏰ Token already expired, auto logout');
                        get().handleAutoLogout();
                        return;
                    }
                    
                    // Set up timers for remaining time
                    const timeLeft = expiryTime - currentTime;
                    const warningTimeLeft = timeLeft - (WARNING_MINUTES * 60 * 1000);
                    
                    let autoLogoutTimer = null;
                    let warningTimer = null;
                    
                    // Set auto logout timer
                    if (timeLeft > 0) {
                        autoLogoutTimer = setTimeout(() => {
                            console.log('⏰ Auto logout triggered on init');
                            get().handleAutoLogout();
                        }, timeLeft);
                    }
                    
                    // Set warning timer if there's enough time left
                    if (warningTimeLeft > 0) {
                        warningTimer = setTimeout(() => {
                            console.log('⚠️ Warning triggered on init');
                            get().showExpiryWarning();
                        }, warningTimeLeft);
                    } else if (timeLeft > 0 && timeLeft <= WARNING_MINUTES * 60 * 1000) {
                        // Already in warning period
                        get().showExpiryWarning();
                    }
                    
                    set({
                        tokenExpiryTime: expiryTime,
                        autoLogoutTimer,
                        warningTimer
                    });
                }
            },
            
            getTimeUntilExpiry: () => {
                const state = get();
                if (!state.tokenExpiryTime) return null;
                
                const timeLeft = state.tokenExpiryTime - Date.now();
                if (timeLeft <= 0) return 0;
                
                return Math.ceil(timeLeft / 1000 / 60); // Return minutes
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
                isAuthenticated: state.isAuthenticated,
                tokenExpiryTime: state.tokenExpiryTime
            }),
        }
    )
);

export default useAuthStore;