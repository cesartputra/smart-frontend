// src/components/common/SessionManager.jsx - Auto logout and session management
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const SessionManager = () => {
    const { 
        isAuthenticated, 
        initializeAuth,
        showExpiryWarning,
        hideExpiryWarning,
        extendSession,
        getTimeUntilExpiry,
        handleAutoLogout
    } = useAuthStore();

    // Initialize auth on component mount
    useEffect(() => {
        if (isAuthenticated) {
            initializeAuth();
        }
    }, [isAuthenticated, initializeAuth]);

    // Periodic check for token status (every 30 seconds)
    useEffect(() => {
        if (!isAuthenticated) return;

        const intervalId = setInterval(() => {
            const timeLeft = getTimeUntilExpiry();
            
            if (timeLeft === null) return;
            
            if (timeLeft <= 0) {
                console.log('⏰ Session expired during periodic check');
                handleAutoLogout();
                return;
            }
            
            // Show detailed countdown in console during last 5 minutes
            if (timeLeft <= 5) {
                console.log(`⏰ Session expires in ${timeLeft} minute(s)`);
            }
        }, 30000); // Every 30 seconds

        return () => clearInterval(intervalId);
    }, [isAuthenticated, getTimeUntilExpiry, handleAutoLogout]);

    // Handle tab focus to check session status
    useEffect(() => {
        if (!isAuthenticated) return;

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Tab became active, check session status
                const timeLeft = getTimeUntilExpiry();
                
                if (timeLeft !== null && timeLeft <= 0) {
                    console.log('⏰ Session expired while tab was inactive');
                    handleAutoLogout();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isAuthenticated, getTimeUntilExpiry, handleAutoLogout]);

    // Expose toast function to auth store
    useEffect(() => {
        window.toast = toast;
    }, []);

    // Show session expiry warning modal
    useEffect(() => {
        if (showExpiryWarning) {
            const timeLeft = getTimeUntilExpiry();
            
            // Create a more prominent warning notification
            const toastId = toast(
                (t) => (
                    <div className="flex flex-col space-y-3">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                    Sesi Akan Berakhir
                                </p>
                                <p className="text-sm text-gray-500">
                                    Sesi Anda akan berakhir dalam {timeLeft} menit
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => {
                                    extendSession();
                                    toast.dismiss(t.id);
                                }}
                                className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors"
                            >
                                Perpanjang Sesi
                            </button>
                            <button
                                onClick={() => {
                                    hideExpiryWarning();
                                    toast.dismiss(t.id);
                                }}
                                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-colors"
                            >
                                Abaikan
                            </button>
                        </div>
                    </div>
                ),
                {
                    duration: Infinity, // Keep until user acts
                    style: {
                        background: '#fff3cd',
                        border: '1px solid #ffeaa7',
                        borderRadius: '8px',
                        padding: '16px',
                        maxWidth: '400px'
                    }
                }
            );

            // Auto-hide warning after 30 seconds if user doesn't act
            setTimeout(() => {
                toast.dismiss(toastId);
                hideExpiryWarning();
            }, 30000);
        }
    }, [showExpiryWarning, getTimeUntilExpiry, extendSession, hideExpiryWarning]);

    // This component doesn't render anything visible
    return null;
};

export default SessionManager;