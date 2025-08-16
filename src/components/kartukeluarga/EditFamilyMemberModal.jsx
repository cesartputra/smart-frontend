// src/components/kartuKeluarga/EditFamilyMemberModal.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Edit3, AlertTriangle } from 'lucide-react';
import { useKartuKeluarga } from '../../hooks/useKartuKeluarga';

const schema = yup.object({
    full_name: yup
        .string()
        .min(2, 'Nama minimal 2 karakter')
        .max(100, 'Nama maksimal 100 karakter')
        .required('Nama lengkap wajib diisi'),
    pob: yup
        .string()
        .min(2, 'Tempat lahir minimal 2 karakter')
        .required('Tempat lahir wajib diisi'),
    dob: yup
        .date()
        .max(new Date(), 'Tanggal lahir tidak boleh di masa depan')
        .required('Tanggal lahir wajib diisi'),
    sex: yup
        .string()
        .oneOf(['L', 'P'], 'Jenis kelamin harus L atau P')
        .required('Jenis kelamin wajib dipilih'),
    religion: yup
        .string()
        .required('Agama wajib dipilih'),
    hubungan_keluarga: yup
        .string()
        .required('Hubungan keluarga wajib dipilih'),
    education: yup
        .string()
        .required('Pendidikan wajib dipilih'),
    occupation: yup
        .string()
        .required('Pekerjaan wajib diisi'),
    marital_status: yup
        .string()
        .required('Status perkawinan wajib dipilih'),
    address: yup
        .string()
        .min(10, 'Alamat minimal 10 karakter')
        .required('Alamat wajib diisi'),
    phone: yup
        .string()
        .matches(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, 'Format nomor HP tidak valid')
        .nullable()
});

const EditFamilyMemberModal = ({ member, onClose }) => {
    const { updateFamilyMember, isUpdatingMember } = useKartuKeluarga();
    const [showAdvanced, setShowAdvanced] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            full_name: member?.full_name || '',
            pob: member?.pob || '',
            dob: member?.dob ? new Date(member.dob).toISOString().split('T')[0] : '',
            sex: member?.sex || '',
            religion: member?.religion || '',
            hubungan_keluarga: member?.hubungan_keluarga || '',
            education: member?.education || '',
            occupation: member?.occupation || '',
            marital_status: member?.marital_status || '',
            address: member?.address || '',
            phone: member?.phone || ''
        }
    });

    // Reset form when member changes
    useEffect(() => {
        if (member) {
            reset({
                full_name: member.full_name || '',
                pob: member.pob || '',
                dob: member.dob ? new Date(member.dob).toISOString().split('T')[0] : '',
                sex: member.sex || '',
                religion: member.religion || '',
                hubungan_keluarga: member.hubungan_keluarga || '',
                education: member.education || '',
                occupation: member.occupation || '',
                marital_status: member.marital_status || '',
                address: member.address || '',
                phone: member.phone || ''
            });
        }
    }, [member, reset]);

    const onSubmit = async (data) => {
        try {
            // Format data sesuai dengan yang diharapkan backend
            const formattedData = {
                ...data,
                // Convert date to ISO string
                dob: new Date(data.dob).toISOString().split('T')[0],
                // Remove empty phone
                phone: data.phone || null
            };

            await updateFamilyMember({ 
                ktpId: member.id, 
                updateData: formattedData 
            });
            onClose();
        } catch (error) {
            console.error('Error updating family member:', error);
        }
    };

    const religionOptions = [
        'Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu'
    ];

    const hubunganKeluargaOptions = [
        'Kepala Keluarga', 'Istri', 'Anak', 'Menantu', 'Cucu', 
        'Orang Tua', 'Mertua', 'Famili Lain', 'Pembantu', 'Lainnya'
    ];

    const educationOptions = [
        'Tidak/Belum Sekolah', 'Belum Tamat SD/Sederajat', 'Tamat SD/Sederajat',
        'SLTP/Sederajat', 'SLTA/Sederajat', 'Diploma I/II', 'Akademi/Diploma III/S. Muda',
        'Diploma IV/Strata I', 'Strata II', 'Strata III'
    ];

    const maritalStatusOptions = [
        'Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'
    ];

    if (!member) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                            <Edit3 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Edit Anggota Keluarga</h2>
                            <p className="text-sm text-gray-600">Perbarui data {member.full_name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                    {/* Warning for users with accounts */}
                    {member.has_user_account && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                                <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-medium text-amber-800 mb-1">
                                        Perhatian: Anggota ini sudah memiliki akun
                                    </h4>
                                    <p className="text-sm text-amber-700">
                                        Beberapa perubahan mungkin memerlukan konfirmasi dari pemilik akun. 
                                        NIK tidak dapat diubah untuk anggota yang sudah memiliki akun.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Member Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-medium text-gray-900 mb-2">Informasi Anggota</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600 font-medium">NIK:</span>
                                <span className="ml-2 text-gray-800">{member.nik}</span>
                            </div>
                            <div>
                                <span className="text-gray-600 font-medium">Status:</span>
                                <span className="ml-2">
                                    {member.has_user_account ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Memiliki Akun
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Belum Ada Akun
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Data Pribadi</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Full Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register('full_name')}
                                        type="text"
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.full_name ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Nama lengkap sesuai KTP"
                                    />
                                    {errors.full_name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                                    )}
                                </div>

                                {/* Place of Birth */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tempat Lahir <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register('pob')}
                                        type="text"
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.pob ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Jakarta"
                                    />
                                    {errors.pob && (
                                        <p className="mt-1 text-sm text-red-600">{errors.pob.message}</p>
                                    )}
                                </div>

                                {/* Date of Birth */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tanggal Lahir <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register('dob')}
                                        type="date"
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.dob ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.dob && (
                                        <p className="mt-1 text-sm text-red-600">{errors.dob.message}</p>
                                    )}
                                </div>

                                {/* Gender */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Jenis Kelamin <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        {...register('sex')}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.sex ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Pilih Jenis Kelamin</option>
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                    {errors.sex && (
                                        <p className="mt-1 text-sm text-red-600">{errors.sex.message}</p>
                                    )}
                                </div>

                                {/* Religion */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Agama <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        {...register('religion')}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.religion ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Pilih Agama</option>
                                        {religionOptions.map(religion => (
                                            <option key={religion} value={religion}>{religion}</option>
                                        ))}
                                    </select>
                                    {errors.religion && (
                                        <p className="mt-1 text-sm text-red-600">{errors.religion.message}</p>
                                    )}
                                </div>

                                {/* Family Relationship */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hubungan Keluarga <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        {...register('hubungan_keluarga')}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.hubungan_keluarga ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        disabled={member.is_kepala_keluarga}
                                    >
                                        <option value="">Pilih Hubungan Keluarga</option>
                                        {hubunganKeluargaOptions.map(hubungan => (
                                            <option key={hubungan} value={hubungan}>{hubungan}</option>
                                        ))}
                                    </select>
                                    {member.is_kepala_keluarga && (
                                        <p className="mt-1 text-sm text-blue-600">
                                            Hubungan keluarga tidak dapat diubah untuk kepala keluarga
                                        </p>
                                    )}
                                    {errors.hubungan_keluarga && (
                                        <p className="mt-1 text-sm text-red-600">{errors.hubungan_keluarga.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Advanced Information */}
                        <div>
                            <button
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
                            >
                                {showAdvanced ? '▼' : '▶'} Data Tambahan
                            </button>

                            {showAdvanced && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Education */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pendidikan <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            {...register('education')}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                errors.education ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        >
                                            <option value="">Pilih Pendidikan</option>
                                            {educationOptions.map(education => (
                                                <option key={education} value={education}>{education}</option>
                                            ))}
                                        </select>
                                        {errors.education && (
                                            <p className="mt-1 text-sm text-red-600">{errors.education.message}</p>
                                        )}
                                    </div>

                                    {/* Marital Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status Perkawinan <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            {...register('marital_status')}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                errors.marital_status ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        >
                                            <option value="">Pilih Status</option>
                                            {maritalStatusOptions.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                        {errors.marital_status && (
                                            <p className="mt-1 text-sm text-red-600">{errors.marital_status.message}</p>
                                        )}
                                    </div>

                                    {/* Occupation */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pekerjaan <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            {...register('occupation')}
                                            type="text"
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                errors.occupation ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="Pekerjaan saat ini"
                                        />
                                        {errors.occupation && (
                                            <p className="mt-1 text-sm text-red-600">{errors.occupation.message}</p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nomor HP (Opsional)
                                        </label>
                                        <input
                                            {...register('phone')}
                                            type="tel"
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                errors.phone ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="08123456789"
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                                        )}
                                    </div>

                                    {/* Address */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Alamat <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            {...register('address')}
                                            rows="3"
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                                                errors.address ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="Alamat lengkap sesuai KTP"
                                        />
                                        {errors.address && (
                                            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdatingMember}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {isUpdatingMember ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Perubahan'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditFamilyMemberModal;