// src/pages/auth/ForgotPassword.jsx
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, ArrowLeft, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useAuthStore from '../../store/authStore';

const schema = yup.object({
    email: yup
        .string()
        .email('Format email tidak valid')
        .required('Email wajib diisi'),
});

const ForgotPassword = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState('');
    
    const { forgotPassword, isLoading } = useAuth();
    const { isAuthenticated } = useAuthStore();

    // Redirect if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            await forgotPassword(data.email);
            setSubmittedEmail(data.email);
            setIsSubmitted(true);
        } catch (error) {
            console.error('Forgot password error:', error);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-6">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Email Terkirim
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Periksa inbox email Anda
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-2xl p-8">
                        <div className="text-center space-y-4">
                            <Mail className="h-12 w-12 text-blue-500 mx-auto" />
                            <h3 className="text-lg font-semibold text-gray-900">
                                Instruksi Reset Password Terkirim
                            </h3>
                            <p className="text-sm text-gray-600">
                                Kami telah mengirimkan link reset password ke:
                            </p>
                            <p className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                                {submittedEmail}
                            </p>
                            <div className="pt-4 space-y-3">
                                <p className="text-xs text-gray-500">
                                    Link akan kedaluwarsa dalam 1 jam. Periksa folder spam jika tidak menerima email.
                                </p>
                                
                                <div className="border-t pt-4">
                                    <button
                                        onClick={() => setIsSubmitted(false)}
                                        className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                                    >
                                        Kirim ulang email
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Kembali ke Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 mb-6">
                        <Mail className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Lupa Password?
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Masukkan email Anda untuk menerima link reset password
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-2xl p-8">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Alamat Email
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                autoComplete="email"
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                    errors.email ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Masukkan email terdaftar Anda"
                            />
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                        Mengirim Email...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="h-4 w-4 mr-2" />
                                        Kirim Link Reset Password
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            Ingat password Anda?{' '}
                            <Link
                                to="/login"
                                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                            >
                                Kembali ke Login
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Tips Keamanan:</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Link reset hanya berlaku 1 jam</li>
                        <li>• Gunakan password yang kuat dan unik</li>
                        <li>• Jangan bagikan link reset ke orang lain</li>
                        <li>• Periksa folder spam jika email tidak masuk</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;