// src/pages/profile/Profile.jsx - Complete Profile with View & Edit
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useUserDetails } from '../../hooks/useUserDetails';
import SignatureCanvas from '../../components/forms/SignatureCanvas';
import { 
    User, 
    Phone, 
    FileSignature, 
    Edit3,
    Save,
    X,
    Mail,
    CreditCard,
    MapPin,
    Calendar,
    CheckCircle,
    ArrowLeft,
    Camera,
    Eye,
    EyeOff,
    Shield
} from 'lucide-react';
import { useUserKtp } from '../../hooks/useUserKtp';

// Validation schema untuk edit
const editProfileSchema = yup.object({
    phone_number: yup
        .string()
        .matches(/^(\+62|62|0)[0-9]{9,13}$/, 'Format nomor telepon Indonesia tidak valid')
        .required('Nomor telepon wajib diisi'),
});

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [signatureData, setSignatureData] = useState(null);
    const [showSignature, setShowSignature] = useState(false);
    
    const { user } = useAuth();
    const { 
        updateUserDetails,
        getUserDetails,
        isUpdating,
        userDetails,
        fetchUserDetails
    } = useUserDetails();
    const {
        getKTP
    } = useUserKtp()

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isDirty },
    } = useForm({
        resolver: yupResolver(editProfileSchema),
        defaultValues: {
            phone_number: '',
        }
    });

    // Load user details saat komponen mount
    useEffect(() => {
        const loadUserDetails = async () => {
            try {
                await fetchUserDetails();
            } catch (error) {
                console.log('Error loading user details:', error);
            }
        };
        const loadUserKtp = async () => {
            try {
                await getKTP();
            } catch (error) {
                console.log('Error loading user KTP:', error);
            }
        };

        
        loadUserDetails();
        loadUserKtp();
    }, [fetchUserDetails, getKTP]);

    // Set form values ketika userDetails berubah
    useEffect(() => {
        if (userDetails) {
            setValue('phone_number', userDetails.phone_number || '');
        }
    }, [userDetails, setValue]);

    const handleEdit = () => {
        setIsEditing(true);
        // Reset form dengan data current
        reset({
            phone_number: userDetails?.phone_number || ''
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setSignatureData(null);
        // Reset ke data original
        reset({
            phone_number: userDetails?.phone_number || ''
        });
    };

    const handleSignatureChange = (signature) => {
        setSignatureData(signature);
    };

    const onSubmit = async (data) => {
        try {
            let updateData = {
                phone_number: data.phone_number,
            };

            // Jika ada signature baru, tambahkan ke update data
            if (signatureData) {
                updateData.signature_base64 = signatureData.dataURL;
            }

            await updateUserDetails(updateData);
            setIsEditing(false);
            setSignatureData(null);
            
            // Refresh user details
            await fetchUserDetails();
            
        } catch (error) {
            console.error('Update profile error:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatPhoneNumber = (phone) => {
        if (!phone) return '-';
        // Format: +62 812-3456-789
        if (phone.startsWith('+62')) {
            return phone.replace(/(\+62)(\d{3})(\d{4})(\d{3,4})/, '$1 $2-$3-$4');
        }
        return phone;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => window.history.back()}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 mr-3"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Profil Saya</h1>
                                <p className="text-sm text-gray-500">Kelola informasi pribadi Anda</p>
                            </div>
                        </div>
                        
                        {!isEditing && (
                            <button
                                onClick={handleEdit}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit Profil
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="text-center">
                                {/* Avatar */}
                                <div className="relative mx-auto w-24 h-24 mb-4">
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <User className="h-12 w-12 text-white" />
                                    </div>
                                    {isEditing && (
                                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                                            <Camera className="h-4 w-4 text-gray-600" />
                                        </button>
                                    )}
                                </div>
                                
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                    {user?.full_name || 'User'}
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
                                
                                {/* Status Badges */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-center">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Email Verified
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            <Shield className="h-3 w-3 mr-1" />
                                            Profil Lengkap
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Statistik</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Bergabung</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {formatDate(user?.createdAt)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Last Update</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {formatDate(userDetails?.updatedAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Personal Information Section */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                            <User className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">Informasi Pribadi</h3>
                                            <p className="text-sm text-gray-500">Data dasar dari KTP Anda</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* NIK */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            NIK
                                        </label>
                                        <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                            <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-gray-700">
                                                {user?.nik ? `${user.nik.slice(0, 4)}-****-****-${user.nik.slice(-4)}` : '-'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nama Lengkap
                                        </label>
                                        <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                            <User className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-gray-700">{user?.full_name || '-'}</span>
                                        </div>
                                    </div>

                                    {/* Place of Birth */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tempat Lahir
                                        </label>
                                        <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-gray-700">{user?.pob || '-'}</span>
                                        </div>
                                    </div>

                                    {/* Date of Birth */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tanggal Lahir
                                        </label>
                                        <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-gray-700">{formatDate(user?.dob)}</span>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-gray-700">{user?.email || '-'}</span>
                                        </div>
                                    </div>

                                    {/* Phone Number - Editable */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nomor Telepon
                                        </label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    {...register('phone_number')}
                                                    type="tel"
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                        errors.phone_number ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                    placeholder="Contoh: +62812345678"
                                                />
                                                {errors.phone_number && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.phone_number.message}</p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-gray-700">
                                                    {formatPhoneNumber(userDetails?.phone_number)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Signature Section */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                            <FileSignature className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">Tanda Tangan Digital</h3>
                                            <p className="text-sm text-gray-500">Untuk pengesahan dokumen resmi</p>
                                        </div>
                                    </div>
                                    
                                    {!isEditing && userDetails?.signature_url && (
                                        <button
                                            type="button"
                                            onClick={() => setShowSignature(!showSignature)}
                                            className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            {showSignature ? (
                                                <>
                                                    <EyeOff className="h-4 w-4 mr-2" />
                                                    Sembunyikan
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Lihat
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {isEditing ? (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Buat tanda tangan baru untuk mengganti yang lama (opsional)
                                        </p>
                                        <SignatureCanvas 
                                            onSignatureChange={handleSignatureChange}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        {userDetails?.signature_url && showSignature ? (
                                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                <img 
                                                    src={userDetails.signature_url} 
                                                    alt="Tanda tangan digital" 
                                                    className="max-h-32 mx-auto"
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <FileSignature className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                                <p className="text-sm">
                                                    {userDetails?.signature_url ? 'Klik "Lihat" untuk menampilkan tanda tangan' : 'Tanda tangan belum tersedia'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            {isEditing && (
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Batal
                                    </button>
                                    
                                    <button
                                        type="submit"
                                        disabled={isUpdating || (!isDirty && !signatureData)}
                                        className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                    >
                                        {isUpdating ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Simpan Perubahan
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;