// src/pages/profile/CompleteProfile.jsx - With Signature Canvas Integration
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
    CheckCircle,
    ArrowRight,
    AlertCircle,
    Loader,
    Mail,
    CreditCard
} from 'lucide-react';

// Updated validation schema - signature_url tidak wajib karena generate dari canvas
const profileSchema = yup.object({
    phone_number: yup
        .string()
        .matches(/^(\+62|62|0)[0-9]{9,13}$/, 'Format nomor telepon Indonesia tidak valid')
        .required('Nomor telepon wajib diisi'),
    signature_data: yup
        .mixed()
        .required('Tanda tangan wajib diisi')
        .test('has-signature', 'Tanda tangan wajib diisi', function(value) {
            return value && (value.dataURL || value.file);
        })
});

const CompleteProfile = () => {
    const [signatureData, setSignatureData] = useState(null);
    const [isUploadingSignature, setIsUploadingSignature] = useState(false);
    
    const { user } = useAuth();
    const { 
        createUserDetails, 
        getUserDetails,
        isLoading
    } = useUserDetails();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        trigger,
        clearErrors,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(profileSchema),
        defaultValues: {
            phone_number: '',
            signature_data: null
        }
    });

    const watchedValues = watch();

    // Check if user already has details
    useEffect(() => {
        const checkExistingDetails = async () => {
            try {
                const details = await getUserDetails();
                if (details?.details) {
                    setValue('phone_number', details.details.phone_number || '');
                    // Note: Existing signature akan perlu di-handle berbeda karena sekarang pakai canvas
                }
            } catch (error) {
                console.log('No existing user details found - new user');
            }
        };

        checkExistingDetails();
    }, [getUserDetails, setValue]);

    // Handle signature change from canvas
    const handleSignatureChange = (signature) => {
        console.log('Signature changed:', signature);
        setSignatureData(signature);
        setValue('signature_data', signature);
        
        if (signature) {
            clearErrors('signature_data');
        }
        
        // Trigger validation
        trigger('signature_data');
    };

    // Simulate upload signature to backend (akan dihandle backend nanti)
    const uploadSignature = async (signatureData) => {
        setIsUploadingSignature(true);
        
        try {
            // Simulate upload process
            console.log('Uploading signature...', {
                hasFile: !!signatureData.file,
                hasDataURL: !!signatureData.dataURL,
                fileSize: signatureData.file?.size
            });
            
            // Mock upload delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // In real implementation, you would:
            // 1. Upload file to storage (AWS S3, Cloudinary, etc.)
            // 2. Get back the URL
            // 3. Return the URL to store in database
            
            const mockSignatureUrl = `https://storage.smartrw.com/signatures/${user.id}_${Date.now()}.png`;
            
            console.log('Signature uploaded successfully:', mockSignatureUrl);
            return mockSignatureUrl;
            
        } catch (error) {
            console.error('Error uploading signature:', error);
            throw error;
        } finally {
            setIsUploadingSignature(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            let signatureUrl = null;
            
            // Upload signature if exists
            if (signatureData) {
                try {
                    signatureUrl = await uploadSignature(signatureData);
                } catch (error) {
                    toast.error('Gagal mengunggah tanda tangan');
                    return;
                }
            }
            
            // Prepare data for backend
            const profileData = {
                phone_number: data.phone_number,
                signature_url: signatureUrl
            };
            
            console.log('Submitting profile data:', profileData);
            
            await createUserDetails(profileData);
            
            // Success akan dihandle oleh hook useAuth → redirect ke dashboard
            
        } catch (error) {
            console.error('Profile completion error:', error);
            toast.error('Gagal menyelesaikan profil');
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
                                        <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-1">
                                            <CheckCircle className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="text-xs">Email Verified</div>
                                    </div>
                                    <div className="h-0.5 w-8 bg-green-400"></div>
                                    <div className="text-center">
                                        <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-1">
                                            <CheckCircle className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="text-xs">KTP Complete</div>
                                    </div>
                                    <div className="h-0.5 w-8 bg-purple-400"></div>
                                    <div className="text-center">
                                        <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center mx-auto mb-1">
                                            <User className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div className="text-xs">Complete Profile</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8">
                        {/* Progress Summary */}
                        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                            <div className="flex items-start">
                                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                                    <User className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Hampir Selesai! 🎉
                                    </h3>
                                    <p className="text-sm text-gray-700 mb-3">
                                        Anda telah berhasil memverifikasi email dan melengkapi data KTP. 
                                        Sekarang lengkapi informasi kontak dan buat tanda tangan digital untuk mengakses semua fitur SMART-RW.
                                    </p>
                                    <div className="flex items-center space-x-4 text-xs">
                                        <div className="flex items-center text-green-600">
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            <span>Email: {user?.email}</span>
                                        </div>
                                        <div className="flex items-center text-green-600">
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            <span>Data KTP Lengkap</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            {/* Phone Number Section */}
                            <div className="space-y-4">
                                <div className="flex items-center mb-4">
                                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        <Phone className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Nomor Telepon
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Untuk notifikasi dan komunikasi penting dari RT/RW
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

                            {/* Signature Canvas Section */}
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
                                            Buat tanda tangan digital untuk pengesahan dokumen
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Signature Canvas */}
                                <SignatureCanvas 
                                    onSignatureChange={handleSignatureChange}
                                    error={errors.signature_data}
                                />
                                
                                {/* Hidden field for form validation */}
                                <input
                                    {...register('signature_data')}
                                    type="hidden"
                                />
                            </div>
                            

                            {/* Submit Button */}
                            <div className="flex justify-end pt-6">
                                <button
                                    type="submit"
                                    disabled={
                                        isLoading || 
                                        isUploadingSignature || 
                                        !watchedValues.signature_data || 
                                        !watchedValues.phone_number
                                    }
                                    className="flex items-center justify-center py-3 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    {isLoading || isUploadingSignature ? (
                                        <>
                                            <Loader className="h-5 w-5 mr-2 animate-spin" />
                                            {isUploadingSignature ? 'Mengunggah tanda tangan...' : 'Menyelesaikan...'}
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

                {/* Info Section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone Usage Info */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-start">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                                <Phone className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Kegunaan Nomor Telepon
                                </h3>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Notifikasi status pengajuan surat</li>
                                    <li>• Informasi kegiatan RT/RW</li>
                                    <li>• Verifikasi keamanan akun</li>
                                    <li>• Komunikasi darurat</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Signature Usage Info */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-start">
                            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                                <FileSignature className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Kegunaan Tanda Tangan Digital
                                </h3>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Pengesahan surat pengantar</li>
                                    <li>• Dokumen resmi RT/RW</li>
                                    <li>• Permohonan administrasi</li>
                                    <li>• Validasi digital dokumen</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Canvas Features Info */}
                <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-start">
                        <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                            <FileSignature className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Fitur Tanda Tangan Canvas
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <ul className="space-y-1">
                                    <li>• ✏️ Gambar langsung di browser</li>
                                    <li>• 🎨 Pilihan warna dan ukuran pena</li>
                                    <li>• 📱 Support mouse dan touch screen</li>
                                </ul>
                                <ul className="space-y-1">
                                    <li>• 🗑️ Hapus dan ulangi kapan saja</li>
                                    <li>• 💾 Download hasil tanda tangan</li>
                                    <li>• 🔒 Aman dan tersimpan otomatis</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Steps Info */}
                <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center">
                        <div className="h-12 w-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                            <ArrowRight className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">
                                Setelah Menyelesaikan Profil
                            </h3>
                            <p className="text-indigo-100">
                                Anda akan diarahkan ke <strong>Dashboard SMART-RW</strong> dan dapat mengakses 
                                semua fitur seperti pengajuan surat, informasi RT/RW, dan layanan warga lainnya.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompleteProfile;