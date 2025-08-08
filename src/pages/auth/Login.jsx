// src/pages/auth/Login.jsx - Remove redirect logic (handled by hook)
import { Link, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import useAuthStore from '../../store/authStore';

const schema = yup.object({
    email: yup
        .string()
        .email('Format email tidak valid')
        .required('Email wajib diisi'),
    password: yup
        .string()
        .required('Password wajib diisi'),
    });

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { signIn, isLoading } = useAuth();
    const { isAuthenticated } = useAuthStore();

    // Redirect if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = (data) => {
        console.log('📝 Login attempt:', { email: data.email });
        signIn(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
            {/* Header */}
            <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 mb-6">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
                Masuk ke SMART-RW
            </h2>
            <p className="mt-2 text-sm text-gray-600">
                Atau{' '}
                <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                >
                daftar akun baru
                </Link>
            </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-2xl p-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {/* Email Field */}
                <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                </label>
                <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan email Anda"
                />
                {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
                </div>

                {/* Password Field */}
                <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                </label>
                <div className="relative">
                    <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan password Anda"
                    />
                    <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                    >
                    <span className="text-lg">{showPassword ? '🙈' : '👁️'}</span>
                    </button>
                </div>
                {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Ingat saya
                    </label>
                </div>

                <div className="text-sm">
                    <Link
                    to="/forgot-password"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                    >
                    Lupa password?
                    </Link>
                </div>
                </div>

                {/* Submit Button */}
                <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memproses...
                    </>
                    ) : (
                    'Masuk'
                    )}
                </button>
                </div>
            </form>
            </div>

            {/* Footer */}
            <div className="text-center">
            <p className="text-xs text-gray-600">
                Dengan masuk, Anda menyetujui{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-500 transition-colors duration-200">
                Syarat & Ketentuan
                </Link>{' '}
                dan{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-500 transition-colors duration-200">
                Kebijakan Privasi
                </Link>
            </p>
            </div>
        </div>
        </div>
    );
};

export default Login;