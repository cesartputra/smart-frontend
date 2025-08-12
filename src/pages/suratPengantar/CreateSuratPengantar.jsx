// src/pages/suratPengantar/CreateSuratPengantar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
    FileText, 
    ArrowLeft, 
    Users, 
    AlertCircle, 
    CheckCircle,
    User,
    Clock,
    FileIcon
} from 'lucide-react';
import { useSuratPengantar } from '../../hooks/useSuratPengantar';
import { useKtp } from '../../hooks/useKtp';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

// Validation schema
const suratPengantarSchema = yup.object({
    surat_pengantar_category_id: yup
        .number()
        .positive('Kategori surat harus dipilih')
        .required('Kategori surat wajib dipilih'),
    user_ktp_id: yup
        .string()
        .required('Pemohon wajib dipilih'),
    reason: yup
        .string()
        .min(10, 'Alasan minimal 10 karakter')
        .max(500, 'Alasan maksimal 500 karakter')
        .required('Alasan pengajuan wajib diisi')
});

const CreateSuratPengantar = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [familyMembers, setFamilyMembers] = useState([]);
    
    const { 
        categories, 
        categoriesLoading, 
        fetchCategories,
        createRequest, 
        isCreating 
    } = useSuratPengantar();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(suratPengantarSchema),
        defaultValues: {
            surat_pengantar_category_id: '',
            user_ktp_id: '',
            reason: ''
        }
    });

    const watchedCategoryId = watch('surat_pengantar_category_id');
    const watchedUserKtpId = watch('user_ktp_id');

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Update selected category when category ID changes
    useEffect(() => {
        if (watchedCategoryId && categories.length > 0) {
            const category = categories.find(cat => cat.id === parseInt(watchedCategoryId));
            setSelectedCategory(category);
        } else {
            setSelectedCategory(null);
        }
    }, [watchedCategoryId, categories]);

    // Fetch family members (simplified - you might need to adjust based on your KTP service)
    useEffect(() => {
        const fetchFamilyMembers = async () => {
            try {
                // This would typically fetch family members from your KTP service
                // For now, we'll simulate with current user data
                const members = [
                    {
                        id: 'current-user',
                        full_name: 'Anda Sendiri',
                        nik: '1234567890123456',
                        is_current_user: true
                    }
                ];
                setFamilyMembers(members);
                
                // Auto-select current user
                if (members.length > 0) {
                    setValue('user_ktp_id', members[0].id);
                }
            } catch (error) {
                console.error('Error fetching family members:', error);
                toast.error('Gagal memuat data anggota keluarga');
            }
        };

        fetchFamilyMembers();
    }, [setValue]);

    const onSubmit = (data) => {
        console.log('Creating surat pengantar:', data);
        createRequest({
            surat_pengantar_category_id: parseInt(data.surat_pengantar_category_id),
            user_ktp_id: data.user_ktp_id,
            reason: data.reason.trim()
        });
    };

    if (categoriesLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <LoadingSpinner text="Memuat data kategori surat..." />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <Link
                            to="/surat-pengantar"
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Kembali ke Daftar Surat
                        </Link>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-8">
                            <div className="flex items-center">
                                <div className="h-12 w-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                                    <FileText className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-2">
                                        Buat Pengajuan Surat Pengantar
                                    </h1>
                                    <p className="text-green-100">
                                        Lengkapi form di bawah untuk mengajukan surat pengantar
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Category Selection */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center mb-6">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <FileIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    Pilih Kategori Surat
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Pilih jenis surat pengantar yang Anda butuhkan
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categories.map((category) => (
                                <div key={category.id} className="relative">
                                    <input
                                        {...register('surat_pengantar_category_id')}
                                        type="radio"
                                        id={`category-${category.id}`}
                                        value={category.id}
                                        className="sr-only"
                                    />
                                    <label
                                        htmlFor={`category-${category.id}`}
                                        className={`block w-full p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                            parseInt(watchedCategoryId) === category.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-start">
                                            <div className={`h-4 w-4 rounded-full border-2 mr-3 mt-0.5 ${
                                                parseInt(watchedCategoryId) === category.id
                                                    ? 'border-blue-500 bg-blue-500'
                                                    : 'border-gray-300'
                                            }`}>
                                                {parseInt(watchedCategoryId) === category.id && (
                                                    <div className="h-2 w-2 bg-white rounded-full m-0.5"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 mb-1">
                                                    {category.name}
                                                </h4>
                                                {category.description && (
                                                    <p className="text-sm text-gray-600">
                                                        {category.description}
                                                    </p>
                                                )}
                                                {category.processing_days && (
                                                    <div className="flex items-center mt-2 text-xs text-gray-500">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        Estimasi {category.processing_days} hari kerja
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>

                        {errors.surat_pengantar_category_id && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.surat_pengantar_category_id.message}
                            </p>
                        )}

                        {/* Category Details */}
                        {selectedCategory && (
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="font-medium text-blue-900 mb-2">
                                    Detail: {selectedCategory.name}
                                </h4>
                                {selectedCategory.reason && (
                                    <div className="mb-3">
                                        <p className="text-sm font-medium text-blue-800 mb-1">Kegunaan:</p>
                                        <p className="text-sm text-blue-700">{selectedCategory.reason}</p>
                                    </div>
                                )}
                                {selectedCategory.required_documents && (
                                    <div>
                                        <p className="text-sm font-medium text-blue-800 mb-1">Dokumen yang diperlukan:</p>
                                        <p className="text-sm text-blue-700">{selectedCategory.required_documents}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Family Member Selection */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center mb-6">
                            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                <Users className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    Pilih Pemohon
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Pilih anggota keluarga yang akan menggunakan surat ini
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {familyMembers.map((member) => (
                                <div key={member.id} className="relative">
                                    <input
                                        {...register('user_ktp_id')}
                                        type="radio"
                                        id={`member-${member.id}`}
                                        value={member.id}
                                        className="sr-only"
                                    />
                                    <label
                                        htmlFor={`member-${member.id}`}
                                        className={`block w-full p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                            watchedUserKtpId === member.id
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`h-4 w-4 rounded-full border-2 mr-3 ${
                                                watchedUserKtpId === member.id
                                                    ? 'border-purple-500 bg-purple-500'
                                                    : 'border-gray-300'
                                            }`}>
                                                {watchedUserKtpId === member.id && (
                                                    <div className="h-2 w-2 bg-white rounded-full m-0.5"></div>
                                                )}
                                            </div>
                                            <User className="h-5 w-5 text-gray-400 mr-3" />
                                            <div className="flex-1">
                                                <div className="flex items-center">
                                                    <h4 className="font-medium text-gray-900">
                                                        {member.full_name}
                                                    </h4>
                                                    {member.is_current_user && (
                                                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                            Anda
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    NIK: {member.nik?.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-****-****-$4')}
                                                </p>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>

                        {errors.user_ktp_id && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.user_ktp_id.message}
                            </p>
                        )}
                    </div>

                    {/* Reason */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center mb-6">
                            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                                <FileText className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    Alasan Pengajuan
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Jelaskan alasan Anda membutuhkan surat ini
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Alasan <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                {...register('reason')}
                                rows={4}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                                    errors.reason ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Contoh: Untuk keperluan pendaftaran sekolah anak saya di SD Negeri 1..."
                            />
                            {errors.reason && (
                                <p className="mt-2 text-sm text-red-600">{errors.reason.message}</p>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                                Minimum 10 karakter, maksimum 500 karakter
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/surat-pengantar"
                                className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-center"
                            >
                                Batal
                            </Link>
                            
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                            >
                                {isCreating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5 mr-2" />
                                        Ajukan Surat Pengantar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Information Panel */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                ℹ️ Informasi Penting
                            </h3>
                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-start">
                                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <p>Pengajuan akan diproses berurutan oleh RT kemudian RW</p>
                                </div>
                                <div className="flex items-start">
                                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <p>Pastikan alasan pengajuan jelas dan sesuai dengan kebutuhan</p>
                                </div>
                                <div className="flex items-start">
                                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <p>Anda akan mendapat notifikasi email untuk setiap perubahan status</p>
                                </div>
                                <div className="flex items-start">
                                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <p>Surat yang sudah disetujui dapat diunduh dalam format PDF selama 7 hari</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateSuratPengantar;