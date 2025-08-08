// src/pages/auth/Register.jsx - Version clean tanpa debug info
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
        .min(8, 'Password minimal 8 karakter')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'Password harus mengandung huruf besar, kecil, angka, dan karakter khusus')
        .required('Password wajib diisi'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'Konfirmasi password tidak cocok')
        .required('Konfirmasi password wajib diisi'),
    });

    const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { signUp, isLoading } = useAuth();
    const { isAuthenticated } = useAuthStore();

    // Only console log for debugging, not UI
    console.log('Register page - isAuthenticated:', isAuthenticated);

    // Restore auth check - redirect if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const password = watch('password', '');

    // Password strength checks
    const passwordChecks = [
        { label: 'Minimal 8 karakter', valid: password.length >= 8 },
        { label: 'Mengandung huruf besar', valid: /[A-Z]/.test(password) },
        { label: 'Mengandung huruf kecil', valid: /[a-z]/.test(password) },
        { label: 'Mengandung angka', valid: /\d/.test(password) },
        { label: 'Mengandung karakter khusus', valid: /[@$!%*?&]/.test(password) },
    ];

    const onSubmit = (data) => {
        console.log('Submitting registration:', data);
        signUp(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
            {/* Header */}
            <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-6">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
                Daftar Akun Baru
            </h2>
            <p className="mt-2 text-sm text-gray-600">
                Sudah punya akun?{' '}
                <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                >
                Masuk di sini
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
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
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
                    autoComplete="new-password"
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Buat password yang kuat"
                    />
                    <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                    >
                    <span className="text-lg">{showPassword ? '🙈' : '👁️'}</span>
                    </button>
                </div>

                {/* Password Strength Indicators */}
                {password && (
                    <div className="mt-3 space-y-1">
                    {passwordChecks.map((check, index) => (
                        <div key={index} className="flex items-center text-xs">
                        <span className={`mr-2 ${check.valid ? 'text-green-500' : 'text-gray-300'}`}>
                            {check.valid ? '✅' : '⭕'}
                        </span>
                        <span className={check.valid ? 'text-green-600' : 'text-gray-500'}>
                            {check.label}
                        </span>
                        </div>
                    ))}
                    </div>
                )}

                {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
                </div>

                {/* Confirm Password Field */}
                <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password
                </label>
                <div className="relative">
                    <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ulangi password Anda"
                    />
                    <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                    <span className="text-lg">{showConfirmPassword ? '🙈' : '👁️'}</span>
                    </button>
                </div>
                {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="text-gray-600">
                    Saya setuju dengan{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                        Syarat & Ketentuan
                    </Link>{' '}
                    dan{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                        Kebijakan Privasi
                    </Link>
                    </label>
                </div>
                </div>

                {/* Submit Button */}
                <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                    'Daftar Akun'
                    )}
                </button>
                </div>
            </form>
            </div>

            {/* Footer */}
            <div className="text-center">
            <p className="text-xs text-gray-600">
                Setelah mendaftar, Anda akan menerima email verifikasi untuk mengaktifkan akun.
            </p>
            </div>
        </div>
        </div>
    );
};

export default Register;