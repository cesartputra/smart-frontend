// src/pages/profile/Profile.jsx - Comprehensive Profile Page
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { 
    User, 
    Phone, 
    FileSignature, 
    CreditCard,
    MapPin,
    Calendar,
    Mail,
    Edit3,
    Save,
    X,
    Camera,
    Shield,
    CheckCircle,
    AlertCircle,
    Eye,
    EyeOff,
    Key,
    Settings
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUserDetails } from '../../hooks/useUserDetails';
import { useUserKtp } from '../../hooks/useUserKtp';

// Validation schemas
const personalInfoSchema = yup.object({
    phone_number: yup
        .string()
        .matches(/^(\+62|62|0)[0-9]{9,13}$/, 'Format nomor telepon Indonesia tidak valid')
        .required('Nomor telepon wajib diisi'),
});

const passwordSchema = yup.object({
    currentPassword: yup.string().required('Password saat ini wajib diisi'),
    newPassword: yup
        .string()
        .min(8, 'Password minimal 8 karakter')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'Password harus mengandung huruf besar, kecil, angka, dan karakter khusus')
        .required('Password baru wajib diisi'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('newPassword')], 'Konfirmasi password tidak cocok')
        .required('Konfirmasi password wajib diisi'),
});

const Profile = () => {
    const [activeTab, setActiveTab] = useState('personal');
    const [isEditingPersonal, setIsEditingPersonal] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const { user, updatePassword, isUpdatingPassword } = useAuth();
    const { 
        userDetails, 
        updateUserDetails, 
        getUserDetails,
        isUpdating: isUpdatingDetails
    } = useUserDetails();
    const { ktpData, fetchKTP } = useUserKtp();

    // Forms
    const personalForm = useForm({
        resolver: yupResolver(personalInfoSchema),
        defaultValues: {
            phone_number: ''
        }
    });

    const passwordForm = useForm({
        resolver: yupResolver(passwordSchema)
    });

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                await getUserDetails();
                await fetchKTP();
            } catch (error) {
                console.error('Error loading profile data:', error);
            }
        };
        loadData();
    }, []);

    // Update form when data loads
    useEffect(() => {
        if (userDetails) {
            personalForm.setValue('phone_number', userDetails.phone_number || '');
        }
    }, [userDetails, personalForm]);

    const handleUpdatePersonalInfo = async (data) => {
        try {
            await updateUserDetails(data);
            setIsEditingPersonal(false);
            toast.success('Informasi pribadi berhasil diperbarui');
        } catch (error) {
            toast.error('Gagal memperbarui informasi pribadi');
        }
    };

    

    const handleUpdatePassword = async (data) => {
        try {
            await updatePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword
            });
            setIsEditingPassword(false);
            passwordForm.reset();
            toast.success('Password berhasil diperbarui');
        } catch (error) {
            toast.error('Gagal memperbarui password');
        }
    };

    const tabs = [
        { id: 'personal', label: 'Informasi Pribadi', icon: User },
        { id: 'ktp', label: 'Data KTP', icon: CreditCard },
        { id: 'security', label: 'Keamanan', icon: Shield },
        { id: 'settings', label: 'Pengaturan', icon: Settings }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
                                <p className="text-sm text-gray-600">Kelola informasi akun Anda</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Profile Header */}
                            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
                                <div className="relative inline-block">
                                    <div className="h-20 w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <User className="h-10 w-10" />
                                    </div>
                                    <button className="absolute bottom-0 right-0 h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                                        <Camera className="h-4 w-4" />
                                    </button>
                                </div>
                                <h3 className="text-lg font-semibold">{user?.full_name || 'User'}</h3>
                                <p className="text-blue-100 text-sm">{user?.email}</p>
                                {user?.isEmailVerified && (
                                    <div className="flex items-center justify-center mt-2">
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        <span className="text-xs">Email Terverifikasi</span>
                                    </div>
                                )}
                            </div>

                            {/* Navigation */}
                            <nav className="p-4">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 mb-2 ${
                                                activeTab === tab.id
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5 mr-3" />
                                            <span className="font-medium">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Personal Information Tab */}
                        {activeTab === 'personal' && (
                            <div className="space-y-6">
                                {/* Basic Info Card */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center">
                                            <User className="h-6 w-6 text-blue-600 mr-3" />
                                            <h2 className="text-xl font-semibold text-gray-900">Informasi Dasar</h2>
                                        </div>
                                        <button
                                            onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                                            className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            {isEditingPersonal ? (
                                                <>
                                                    <X className="h-4 w-4 mr-2" />
                                                    Batal
                                                </>
                                            ) : (
                                                <>
                                                    <Edit3 className="h-4 w-4 mr-2" />
                                                    Edit
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {isEditingPersonal ? (
                                        <form onSubmit={personalForm.handleSubmit(handleUpdatePersonalInfo)} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nomor Telepon
                                                </label>
                                                <input
                                                    {...personalForm.register('phone_number')}
                                                    type="tel"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="+62812345678"
                                                />
                                                {personalForm.formState.errors.phone_number && (
                                                    <p className="mt-2 text-sm text-red-600">
                                                        {personalForm.formState.errors.phone_number.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex justify-end space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditingPersonal(false)}
                                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    Batal
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isUpdatingDetails}
                                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                                >
                                                    {isUpdatingDetails ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                            Menyimpan...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="h-4 w-4 mr-2" />
                                                            Simpan
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-2">Email</label>
                                                <div className="flex items-center">
                                                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-gray-900">{user?.email}</span>
                                                    {user?.isEmailVerified && (
                                                        <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-2">Nomor Telepon</label>
                                                <div className="flex items-center">
                                                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-gray-900">
                                                        {userDetails?.phone_number || 'Belum diisi'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-2">Tanda Tangan</label>
                                                <div className="flex items-center">
                                                    <FileSignature className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-gray-900">
                                                        {userDetails?.signature_url ? 'Sudah diatur' : 'Belum diisi'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-2">Status Akun</label>
                                                <div className="flex items-center">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                                    <span className="text-green-700 font-medium">Aktif</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Signature Preview */}
                                {userDetails?.signature_url && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center mb-4">
                                            <FileSignature className="h-6 w-6 text-purple-600 mr-3" />
                                            <h3 className="text-lg font-semibold text-gray-900">Tanda Tangan Digital</h3>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                                            <img 
                                                src={`${import.meta.env.VITE_API_BASE_URL}${userDetails.signature_url}`} 
                                                alt="Tanda tangan digital" 
                                                className="max-h-32 mx-auto border border-gray-200 rounded"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* KTP Data Tab */}
                        {activeTab === 'ktp' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center mb-6">
                                    <CreditCard className="h-6 w-6 text-green-600 mr-3" />
                                    <h2 className="text-xl font-semibold text-gray-900">Data KTP</h2>
                                </div>

                                {ktpData.data ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-2">NIK</label>
                                                <p className="text-gray-900 font-mono">{ktpData.data?.nik}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-2">Nama Lengkap</label>
                                                <p className="text-gray-900">{ktpData.data?.full_name}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-2">Tempat, Tanggal Lahir</label>
                                                <p className="text-gray-900">
                                                    {ktpData.data?.pob}, {new Date(ktpData.data?.dob).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-2">Jenis Kelamin</label>
                                                <p className="text-gray-900">{ktpData.data?.sex === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-500 mb-2">Alamat</label>
                                                <div className="flex items-start">
                                                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                                                    <div>
                                                        <p className="text-gray-900">{ktpData.data?.address}</p>
                                                        <p className="text-sm text-gray-600">
                                                            RT {ktpData.data?.rt_no?.toString().padStart(2, '0')} / 
                                                            RW {ktpData.data?.rw_no?.toString().padStart(2, '0')}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {ktpData.data?.kelurahan_name}, {ktpData.data?.kecamatan_name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                <span>Terakhir diperbarui: {new Date(ktpData.data?.updated_at).toLocaleDateString('id-ID')}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Data KTP</h3>
                                        <p className="text-gray-600">Silakan lengkapi data KTP Anda terlebih dahulu</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                {/* Change Password */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center">
                                            <Key className="h-6 w-6 text-yellow-600 mr-3" />
                                            <h2 className="text-xl font-semibold text-gray-900">Ubah Password</h2>
                                        </div>
                                        <button
                                            onClick={() => setIsEditingPassword(!isEditingPassword)}
                                            className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            {isEditingPassword ? (
                                                <>
                                                    <X className="h-4 w-4 mr-2" />
                                                    Batal
                                                </>
                                            ) : (
                                                <>
                                                    <Edit3 className="h-4 w-4 mr-2" />
                                                    Ubah Password
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {isEditingPassword ? (
                                        <form onSubmit={passwordForm.handleSubmit(handleUpdatePassword)} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Password Saat Ini
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        {...passwordForm.register('currentPassword')}
                                                        type={showCurrentPassword ? 'text' : 'password'}
                                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Masukkan password saat ini"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                                {passwordForm.formState.errors.currentPassword && (
                                                    <p className="mt-2 text-sm text-red-600">
                                                        {passwordForm.formState.errors.currentPassword.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Password Baru
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        {...passwordForm.register('newPassword')}
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Masukkan password baru"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                                {passwordForm.formState.errors.newPassword && (
                                                    <p className="mt-2 text-sm text-red-600">
                                                        {passwordForm.formState.errors.newPassword.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Konfirmasi Password Baru
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        {...passwordForm.register('confirmPassword')}
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Konfirmasi password baru"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                                {passwordForm.formState.errors.confirmPassword && (
                                                    <p className="mt-2 text-sm text-red-600">
                                                        {passwordForm.formState.errors.confirmPassword.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex justify-end space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditingPassword(false)}
                                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    Batal
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isUpdatingPassword}
                                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                                >
                                                    {isUpdatingPassword ? (
                                                        <>
                                                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                                                            Menyimpan...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="h-4 w-4 mr-2" />
                                                            Simpan Password
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Password Tersimpan Aman</h3>
                                            <p className="text-gray-600">Klik tombol "Ubah Password" untuk mengubah password Anda</p>
                                        </div>
                                    )}
                                </div>

                                {/* Security Status */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center mb-4">
                                        <Shield className="h-6 w-6 text-green-600 mr-3" />
                                        <h3 className="text-lg font-semibold text-gray-900">Status Keamanan</h3>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                                <span className="text-gray-900">Email Terverifikasi</span>
                                            </div>
                                            <span className="text-green-600 text-sm font-medium">Aktif</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                                <span className="text-gray-900">Data KTP Lengkap</span>
                                            </div>
                                            <span className="text-green-600 text-sm font-medium">Selesai</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                                <span className="text-gray-900">Profil Terverifikasi</span>
                                            </div>
                                            <span className="text-green-600 text-sm font-medium">Aktif</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center mb-6">
                                    <Settings className="h-6 w-6 text-gray-600 mr-3" />
                                    <h2 className="text-xl font-semibold text-gray-900">Pengaturan Akun</h2>
                                </div>
                                
                                <div className="text-center py-12">
                                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Pengaturan akan datang</h3>
                                    <p className="text-gray-600">Fitur pengaturan lanjutan sedang dalam pengembangan</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;