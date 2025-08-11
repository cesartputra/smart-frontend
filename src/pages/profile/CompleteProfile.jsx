// src/pages/profile/CompleteProfile.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useUserDetails } from '../../hooks/useUserDetails';
import { Phone, FileSignature, CheckCircle, Upload, User } from 'lucide-react';

// Validation schema sesuai backend
const profileSchema = yup.object({
    phone_number: yup
        .string()
        .matches(/^(\+62|62|0)[0-9]{9,13}$/, 'Format nomor telepon Indonesia tidak valid')
        .required('Nomor telepon wajib diisi'),
    signature_url: yup
        .string()
        .url('URL tanda tangan harus berupa URL yang valid')
        .required('Tanda tangan digital wajib diisi')
});

const CompleteProfile = () => {
    const [signatureFile, setSignatureFile] = useState(null);
    const [signaturePreview, setSignaturePreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    
    const { user } = useAuth();
    const { 
        createUserDetails, 
        updateUserDetails, 
        getUserDetails,
        isLoading,
        userDetails 
    } = useUserDetails();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(profileSchema),
        defaultValues: {
            phone_number: '',
            signature_url: ''
        }
    });

    const watchedValues = watch();

    // Load existing user details jika ada
    useEffect(() => {
        const loadUserDetails = async () => {
            try {
                const details = await getUserDetails();
                if (details) {
                    setValue('phone_number', details.phone_number || '');
                    setValue('signature_url', details.signature_url || '');
                    setSignaturePreview(details.signature_url || '');
                }
            } catch (error) {
                // User belum punya details, ini normal untuk complete profile
                console.log('No existing user details found');
            }
        };

        loadUserDetails();
    }, [getUserDetails, setValue]);

    // Handle file upload untuk signature
    const handleSignatureUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('File harus berupa gambar');
            return;
        }

        // Validate file size (max 2MB)
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

        // Simulate upload to get URL (implement sesuai backend storage Anda)
        await uploadSignature(file);
    };

    // Simulate signature upload - sesuaikan dengan storage backend Anda
    const uploadSignature = async (file) => {
        setIsUploading(true);
        try {
            // Simulasi upload ke storage service (AWS S3, Cloudinary, etc)
            // Ganti dengan actual upload implementation
            
            // For now, menggunakan mock URL
            // Di production, ini harus actual upload ke storage service
            const mockUrl = `https://storage.smartrw.com/signatures/${user.id}_${Date.now()}.${file.name.split('.').pop()}`;
            
            // Simulate upload delay
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
            if (userDetails) {
                // Update existing details
                await updateUserDetails(data);
                toast.success('Profil berhasil diperbarui!');
            } else {
                // Create new details
                await createUserDetails(data);
                toast.success('Profil berhasil dilengkapi!');
            }
            
            // Navigation akan ditangani oleh hook useAuth berdasarkan completion status
            
        } catch (error) {
            console.error('Profile completion error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto h-20 w-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                        <User className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Lengkapi Profil Anda
                    </h1>
                    <p className="text-lg text-gray-600">
                        Tahap terakhir untuk menyelesaikan registrasi
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-4">
                        <div className="flex items-center text-green-600">
                            <div className="h-8 w-8 rounded-full bg-green-100 border-2 border-green-600 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <span className="ml-2 text-sm font-medium">Email Verified</span>
                        </div>
                        
                        <div className="h-0.5 w-16 bg-green-600"></div>
                        
                        <div className="flex items-center text-green-600">
                            <div className="h-8 w-8 rounded-full bg-green-100 border-2 border-green-600 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <span className="ml-2 text-sm font-medium">KTP Completed</span>
                        </div>
                        
                        <div className="h-0.5 w-16 bg-blue-600"></div>
                        
                        <div className="flex items-center text-blue-600">
                            <div className="h-8 w-8 rounded-full bg-blue-100 border-2 border-blue-600 flex items-center justify-center">
                                <span className="text-sm font-semibold">3</span>
                            </div>
                            <span className="ml-2 text-sm font-medium">Complete Profile</span>
                        </div>
                    </div>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Phone className="inline h-4 w-4 mr-2" />
                                Nomor Telepon <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('phone_number')}
                                type="tel"
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                                    errors.phone_number ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Contoh: +62812345678 atau 08123456789"
                            />
                            {errors.phone_number && (
                                <p className="mt-2 text-sm text-red-600">{errors.phone_number.message}</p>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                                Format yang didukung: +62xxx, 62xxx, atau 08xxx
                            </p>
                        </div>

                        {/* Signature Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FileSignature className="inline h-4 w-4 mr-2" />
                                Tanda Tangan Digital <span className="text-red-500">*</span>
                            </label>
                            
                            {/* Upload Area */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                {signaturePreview ? (
                                    <div className="space-y-4">
                                        <img 
                                            src={signaturePreview} 
                                            alt="Signature preview" 
                                            className="mx-auto max-h-32 border rounded"
                                        />
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-green-600">
                                                Tanda tangan berhasil diunggah
                                            </p>
                                            <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                                                <Upload className="h-4 w-4 mr-2" />
                                                Ganti Tanda Tangan
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleSignatureUpload}
                                                    disabled={isUploading}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <FileSignature className="mx-auto h-12 w-12 text-gray-400" />
                                        <div>
                                            <label className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 cursor-pointer">
                                                {isUploading ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Mengunggah...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Unggah Tanda Tangan
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleSignatureUpload}
                                                    disabled={isUploading}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Format: PNG, JPG, JPEG. Maksimal 2MB
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Hidden URL field - diisi otomatis setelah upload */}
                            <input
                                {...register('signature_url')}
                                type="hidden"
                            />
                            
                            {errors.signature_url && (
                                <p className="mt-2 text-sm text-red-600">{errors.signature_url.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isLoading || isUploading || !watchedValues.signature_url}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5 mr-2" />
                                        {userDetails ? 'Perbarui Profil' : 'Selesaikan Registrasi'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Card */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Informasi Penting
                    </h3>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-start">
                            <Phone className="h-4 w-4 text-purple-500 mt-0.5 mr-3 flex-shrink-0" />
                            <p>
                                <strong>Nomor Telepon:</strong> Akan digunakan untuk notifikasi sistem dan 
                                komunikasi penting dari RT/RW.
                            </p>
                        </div>
                        <div className="flex items-start">
                            <FileSignature className="h-4 w-4 text-purple-500 mt-0.5 mr-3 flex-shrink-0" />
                            <p>
                                <strong>Tanda Tangan Digital:</strong> Diperlukan untuk pengesahan dokumen 
                                seperti surat pengantar dan dokumen resmi lainnya.
                            </p>
                        </div>
                        <div className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <p>
                                <strong>Setelah selesai:</strong> Anda akan dapat mengakses semua fitur 
                                SMART-RW termasuk mengajukan surat pengantar dan menggunakan layanan RT/RW.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompleteProfile;