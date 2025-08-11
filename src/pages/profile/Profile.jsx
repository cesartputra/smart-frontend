// src/pages/profile/Profile.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useUserDetails } from '../../hooks/useUserDetails';
import { useKtp } from '../../hooks/useKtp';
import { 
    User, 
    Phone, 
    FileSignature, 
    CreditCard, 
    Mail, 
    MapPin, 
    Calendar, 
    Users,
    Edit3,
    Save,
    X,
    CheckCircle,
    Upload
} from 'lucide-react';

// Validation schema untuk update
const updateProfileSchema = yup.object({
    phone_number: yup
        .string()
        .matches(/^(\+62|62|0)[0-9]{9,13}$/, 'Format nomor telepon Indonesia tidak valid')
        .required('Nomor telepon wajib diisi'),
    signature_url: yup
        .string()
        .url('URL tanda tangan harus berupa URL yang valid')
        .required('Tanda tangan digital wajib diisi')
});

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [signatureFile, setSignatureFile] = useState(null);
    const [signaturePreview, setSignaturePreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const { user } = useAuth();
    const { updateUserDetails, getUserDetails, isLoading, userDetails } = useUserDetails();
    const { ktpData, fetchKTP } = useKtp();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(updateProfileSchema),
        defaultValues: {
            phone_number: '',
            signature_url: ''
        }
    });

    const watchedValues = watch();

    // Load user data on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load user details
                const details = await getUserDetails();
                if (details?.details) {
                    setValue('phone_number', details.details.phone_number || '');
                    setValue('signature_url', details.details.signature_url || '');
                    setSignaturePreview(details.details.signature_url || '');
                }

                // Load KTP data
                fetchKTP();
            } catch (error) {
                console.error('Error loading profile data:', error);
            }
        };

        loadData();
    }, [getUserDetails, fetchKTP, setValue]);

    // Handle signature upload
    const handleSignatureUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            toast.error('File harus berupa gambar');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Ukuran file maksimal 2MB');
            return;
        }

        setSignatureFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setSignaturePreview(e.target.result);
        };
        reader.readAsDataURL(file);

        // Upload signature
        await uploadSignature(file);
    };

    // Simulate signature upload - sesuaikan dengan backend storage
    const uploadSignature = async (file) => {
        setIsUploading(true);
        try {
            // Mock upload - implement actual upload sesuai backend
            const mockUrl = `https://storage.smartrw.com/signatures/${user.id}_${Date.now()}.${file.name.split('.').pop()}`;
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            setValue('signature_url', mockUrl);
            toast.success('Tanda tangan berhasil diunggah');
            
        } catch (error) {
            toast.error('Gagal mengunggah tanda tangan');
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            await updateUserDetails(data);
            setIsEditing(false);
            
            // Reload data setelah update
            const updatedDetails = await getUserDetails();
            if (updatedDetails?.details) {
                setValue('phone_number', updatedDetails.details.phone_number);
                setValue('signature_url', updatedDetails.details.signature_url);
                setSignaturePreview(updatedDetails.details.signature_url);
            }
            
        } catch (error) {
            console.error('Profile update error:', error);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        reset();
        
        // Reset preview
        if (userDetails) {
            setSignaturePreview(userDetails.signature_url || '');
            setValue('phone_number', userDetails.phone_number || '');
            setValue('signature_url', userDetails.signature_url || '');
        }
    };

    // Format tanggal
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Format NIK dengan mask (lanjutan dari kode yang terpotong)
    const formatNIK = (nik) => {
        if (!nik) return '-';
        return nik.replace(/(\d{6})(\d{6})(\d{4})/, '$1-$2-$3');
    };

    // Format nomor telepon
    const formatPhoneNumber = (phone) => {
        if (!phone) return '-';
        return phone.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <User className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">
                                        Profil Pengguna
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        Kelola informasi pribadi Anda
                                    </p>
                                </div>
                            </div>
                            
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Edit3 className="h-4 w-4" />
                                    <span>Edit Profil</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Data Pribadi */}
                            <div className="space-y-6">
                                <div className="border-b border-gray-200 pb-4">
                                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                        <Users className="h-5 w-5 mr-2 text-gray-500" />
                                        Data Pribadi
                                    </h2>
                                </div>

                                {/* Email - Read Only */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Mail className="h-4 w-4 inline mr-1" />
                                        Email
                                    </label>
                                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                                        {user?.email || '-'}
                                    </div>
                                </div>

                                {/* Nama Lengkap - From KTP */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <User className="h-4 w-4 inline mr-1" />
                                        Nama Lengkap
                                    </label>
                                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                                        {ktpData?.nama || '-'}
                                    </div>
                                </div>

                                {/* NIK - From KTP */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <CreditCard className="h-4 w-4 inline mr-1" />
                                        NIK
                                    </label>
                                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-mono">
                                        {formatNIK(ktpData?.nik)}
                                    </div>
                                </div>

                                {/* Tempat, Tanggal Lahir - From KTP */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Calendar className="h-4 w-4 inline mr-1" />
                                        Tempat, Tanggal Lahir
                                    </label>
                                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                                        {ktpData?.tempat_lahir && ktpData?.tanggal_lahir 
                                            ? `${ktpData.tempat_lahir}, ${formatDate(ktpData.tanggal_lahir)}`
                                            : '-'
                                        }
                                    </div>
                                </div>

                                {/* Alamat - From KTP */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="h-4 w-4 inline mr-1" />
                                        Alamat
                                    </label>
                                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                                        {ktpData?.alamat || '-'}
                                    </div>
                                </div>
                            </div>

                            {/* Data Kontak & Tanda Tangan */}
                            <div className="space-y-6">
                                <div className="border-b border-gray-200 pb-4">
                                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                        <Phone className="h-5 w-5 mr-2 text-gray-500" />
                                        Kontak & Tanda Tangan
                                    </h2>
                                </div>

                                {/* Nomor Telepon */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Phone className="h-4 w-4 inline mr-1" />
                                        Nomor Telepon
                                    </label>
                                    {isEditing ? (
                                        <div>
                                            <input
                                                type="tel"
                                                {...register('phone_number')}
                                                placeholder="Contoh: 081234567890"
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    errors.phone_number ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            />
                                            {errors.phone_number && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.phone_number.message}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                                            {formatPhoneNumber(userDetails?.phone_number)}
                                        </div>
                                    )}
                                </div>

                                {/* Tanda Tangan Digital */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FileSignature className="h-4 w-4 inline mr-1" />
                                        Tanda Tangan Digital
                                    </label>
                                    
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            {/* Upload Area */}
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleSignatureUpload}
                                                    className="hidden"
                                                    id="signature-upload"
                                                    disabled={isUploading}
                                                />
                                                <label 
                                                    htmlFor="signature-upload" 
                                                    className={`cursor-pointer ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
                                                >
                                                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-600">
                                                        {isUploading ? 'Mengunggah...' : 'Klik untuk unggah tanda tangan'}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Format: JPG, PNG (Maks. 2MB)
                                                    </p>
                                                </label>
                                            </div>

                                            {/* Preview */}
                                            {signaturePreview && (
                                                <div className="border border-gray-200 rounded-lg p-3">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                                                    <img 
                                                        src={signaturePreview} 
                                                        alt="Preview tanda tangan"
                                                        className="max-h-32 max-w-full object-contain border border-gray-200 rounded"
                                                    />
                                                </div>
                                            )}

                                            {/* Hidden URL input for validation */}
                                            <input
                                                type="hidden"
                                                {...register('signature_url')}
                                            />
                                            {errors.signature_url && (
                                                <p className="text-sm text-red-600">
                                                    {errors.signature_url.message}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {userDetails?.signature_url ? (
                                                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm text-gray-600">Tanda Tangan:</span>
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    </div>
                                                    <img 
                                                        src={userDetails.signature_url} 
                                                        alt="Tanda tangan"
                                                        className="max-h-24 max-w-full object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-center">
                                                    Belum ada tanda tangan
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Batal</span>
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || isUploading}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>
                                        {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </span>
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;