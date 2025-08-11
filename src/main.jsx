// src/main.jsx - Updated with global error handler
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

// Polyfills for browser
if (typeof global === 'undefined') {
  window.global = window;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 401 (unauthorized) errors
        if (error?.response?.status === 401) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry on 401 errors
        if (error?.response?.status === 401) {
          return false;
        }
        return failureCount < 1;
      }
    }
  },
});

// Global error handler for uncaught promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Handle 401 errors globally
  if (event.reason?.response?.status === 401) {
    console.log('🔒 Global 401 handler triggered');
    
    // Import auth store dynamically to avoid circular dependencies
    import('./store/authStore').then(({ default: useAuthStore }) => {
      const authStore = useAuthStore.getState();
      if (authStore.isAuthenticated) {
        console.log('🚪 Auto logout due to 401 error');
        authStore.handleAutoLogout();
      }
    });
  }
  
  // Prevent the default browser error handling
  event.preventDefault();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'text-sm',
          style: {
            borderRadius: '8px',
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </BrowserRouter>
  </QueryClientProvider>
);