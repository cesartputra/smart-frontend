// src/pages/profile/Profile.jsx - Improved Complete Profile Design
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useUserDetails } from '../../hooks/useUserDetails';
import { 
    User, 
    Phone, 
    FileSignature, 
    CheckCircle,
    Upload,
    ArrowRight,
    AlertCircle,
    Loader
} from 'lucide-react';

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

        // Simulate upload to get URL
        await uploadSignature(file);
    };

    // Simulate signature upload
    const uploadSignature = async (file) => {
        setIsUploading(true);
        try {
            // Mock URL - ganti dengan actual upload implementation
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
                await updateUserDetails(data);
            } else {
                await createUserDetails(data);
            }
        } catch (error) {
            console.error('Profile completion error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header - Konsisten dengan CompleteKTP */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-2">
                                    Lengkapi Profil Anda
                                </h1>
                                <p className="text-purple-100">
                                    Tahap terakhir untuk menyelesaikan registrasi
                                </p>
                            </div>
                            <div className="hidden sm:block">
                                <div className="flex items-center space-x-4 text-purple-100">
                                    <div className="text-center">
                                        <CheckCircle className="h-8 w-8 mx-auto mb-1 text-green-300" />
                                        <div className="text-xs">Email Verified</div>
                                    </div>
                                    <div className="h-8 w-px bg-purple-300"></div>
                                    <div className="text-center">
                                        <CheckCircle className="h-8 w-8 mx-auto mb-1 text-green-300" />
                                        <div className="text-xs">KTP Completed</div>
                                    </div>
                                    <div className="h-8 w-px bg-purple-300"></div>
                                    <div className="text-center">
                                        <User className="h-8 w-8 mx-auto mb-1 text-white bg-purple-500 rounded-full p-1" />
                                        <div className="text-xs">Complete Profile</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            {/* Phone Number Section */}
                            <div className="space-y-4">
                                <div className="flex items-center mb-4">
                                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        <Phone className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Kontak Telepon
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Untuk notifikasi dan komunikasi sistem
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200"></div>

                            {/* Signature Upload Section */}
                            <div className="space-y-4">
                                <div className="flex items-center mb-4">
                                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                        <FileSignature className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Tanda Tangan Digital
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Untuk pengesahan dokumen resmi
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Upload Area */}
                                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                                    signaturePreview 
                                        ? 'border-green-300 bg-green-50' 
                                        : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                                }`}>
                                    {signaturePreview ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-center mb-4">
                                                <CheckCircle className="h-8 w-8 text-green-600" />
                                            </div>
                                            <img 
                                                src={signaturePreview} 
                                                alt="Signature preview" 
                                                className="mx-auto max-h-32 border border-gray-200 rounded-lg shadow-sm"
                                            />
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-green-700">
                                                    Tanda tangan berhasil diunggah
                                                </p>
                                                <label className="inline-flex items-center px-4 py-2 border border-purple-300 rounded-lg text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 cursor-pointer transition-colors duration-200">
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
                                            <FileSignature className="mx-auto h-16 w-16 text-gray-400" />
                                            <div>
                                                <h4 className="text-lg font-medium text-gray-900 mb-2">
                                                    Unggah Tanda Tangan Anda
                                                </h4>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    File gambar dengan format PNG, JPG, atau JPEG
                                                </p>
                                                <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl">
                                                    {isUploading ? (
                                                        <>
                                                            <Loader className="h-5 w-5 mr-2 animate-spin" />
                                                            Mengunggah...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="h-5 w-5 mr-2" />
                                                            Pilih File
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
                                            <p className="text-xs text-gray-400">
                                                Maksimal ukuran file: 2MB
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Hidden URL field */}
                                <input
                                    {...register('signature_url')}
                                    type="hidden"
                                />
                                
                                {errors.signature_url && (
                                    <p className="mt-2 text-sm text-red-600">{errors.signature_url.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-6">
                                <button
                                    type="submit"
                                    disabled={isLoading || isUploading || !watchedValues.signature_url}
                                    className="flex items-center justify-center py-3 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader className="h-5 w-5 mr-2 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-5 w-5 mr-2" />
                                            Selesaikan Registrasi
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Info Cards - Konsisten dengan CompleteKTP */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone Info */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-start">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                                <Phone className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Nomor Telepon
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Nomor ini akan digunakan untuk:
                                </p>
                                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                                    <li>• Notifikasi sistem penting</li>
                                    <li>• Komunikasi dari RT/RW</li>
                                    <li>• Verifikasi keamanan</li>
                                    <li>• Update status dokumen</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Signature Info */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-start">
                            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                                <FileSignature className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Tanda Tangan Digital
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Tanda tangan ini akan digunakan untuk:
                                </p>
                                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                                    <li>• Pengesahan surat pengantar</li>
                                    <li>• Dokumen resmi RT/RW</li>
                                    <li>• Permohonan layanan</li>
                                    <li>• Validasi identitas</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Completion Status */}
                <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-sm p-6 border border-green-200">
                    <div className="flex items-center">
                        <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                            <AlertCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Setelah Menyelesaikan Profil
                            </h3>
                            <p className="text-sm text-gray-700">
                                Anda akan dapat mengakses semua fitur SMART-RW termasuk mengajukan 
                                surat pengantar, menggunakan layanan RT/RW, dan berpartisipasi dalam 
                                sistem manajemen warga digital.
                            </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompleteProfile;