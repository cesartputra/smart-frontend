// src/pages/auth/ResetPassword.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Key, Eye, EyeOff, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useAuthStore from '../../store/authStore';

const schema = yup.object({
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

const ResetPassword = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState(null);
    
    const { token } = useParams();
    const navigate = useNavigate();
    const { resetPassword, verifyResetToken, isLoading } = useAuth();
    const { isAuthenticated } = useAuthStore();

    // Redirect if already authenticated
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

    // Verify token on mount
    useEffect(() => {
        const checkToken = async () => {
            if (!token) {
                setTokenValid(false);
                return;
            }

            try {
                await verifyResetToken(token);
                setTokenValid(true);
            } catch (error) {
                console.error('Token verification failed:', error);
                setTokenValid(false);
            }
        };

        checkToken();
    }, [token, verifyResetToken]);

    const onSubmit = async (data) => {
        try {
            await resetPassword(token, data.password);
            setIsSuccess(true);
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login', { 
                    state: { 
                        message: 'Password berhasil direset. Silakan login dengan password baru.',
                        type: 'success'
                    }
                });
            }, 3000);
        } catch (error) {
            console.error('Reset password error:', error);
        }
    };

    // Loading state while verifying token
    if (tokenValid === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <Loader className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Memverifikasi token reset password...</p>
                </div>
            </div>
        );
    }

    // Invalid token
    if (tokenValid === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 mb-6">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Token Tidak Valid
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Link reset password tidak valid atau sudah kedaluwarsa
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Tidak Dapat Mereset Password
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Link mungkin sudah kedaluwarsa atau sudah digunakan. 
                            Silakan minta link reset password yang baru.
                        </p>
                        
                        <div className="space-y-3">
                            <Link
                                to="/forgot-password"
                                className="w-full inline-flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                Minta Link Reset Baru
                            </Link>
                            <Link
                                to="/login"
                                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                Kembali ke Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-6">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Password Berhasil Direset
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Anda akan dialihkan ke halaman login
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Password Baru Telah Tersimpan
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Password Anda berhasil direset. Silakan login menggunakan password baru.
                        </p>
                        
                        <div className="flex items-center justify-center text-sm text-gray-500">
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Mengalihkan dalam 3 detik...
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
                        >
                            Atau klik di sini untuk login sekarang
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
                        <Key className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Masukkan password baru Anda
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-2xl p-8">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password Baru
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                        errors.password ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Masukkan password baru"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Konfirmasi Password Baru
                            </label>
                            <div className="relative">
                                <input
                                    {...register('confirmPassword')}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Konfirmasi password baru"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
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
                                        Mereset Password...
                                    </>
                                ) : (
                                    <>
                                        <Key className="h-4 w-4 mr-2" />
                                        Reset Password
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Kembali ke Login
                        </Link>
                    </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Tips Password Aman:</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Gunakan kombinasi huruf besar, kecil, angka, dan simbol</li>
                        <li>• Minimal 8 karakter, disarankan 12+ karakter</li>
                        <li>• Jangan gunakan informasi pribadi yang mudah ditebak</li>
                        <li>• Gunakan password yang unik untuk setiap akun</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;