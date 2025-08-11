import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { useKtp } from '../../hooks/useKtp';
import { Search, UserCheck, Users, AlertCircle, CheckCircle } from 'lucide-react';
import LocationSelector from '../../components/forms/LocationSelector';
import ClaimableKTPCard from '../../components/ktp/ClaimableKTPCard';

// FIXED: Updated validation schema sesuai backend
const ktpSchema = yup.object({
    nik: yup
        .string()
        .matches(/^\d{16}$/, 'NIK harus 16 digit angka')
        .required('NIK wajib diisi'),
    
    // FIXED: Field nama sesuai backend (full_name bukan fullName)
    full_name: yup
        .string()
        .min(2, 'Nama minimal 2 karakter')
        .max(255, 'Nama maksimal 255 karakter')
        .when('claiming', {
            is: false,
            then: (schema) => schema.required('Nama lengkap wajib diisi')
        }),
    
    pob: yup
        .string()
        .max(100, 'Tempat lahir maksimal 100 karakter')
        .when('claiming', {
            is: false,
            then: (schema) => schema.required('Tempat lahir wajib diisi')
        }),
    
    dob: yup
        .date()
        .max(new Date(new Date().setFullYear(new Date().getFullYear() - 17)), 
            'Usia minimal 17 tahun')
        .when('claiming', {
            is: false,
            then: (schema) => schema.required('Tanggal lahir wajib diisi')
        }),
    
    sex: yup
        .string()
        .oneOf(['L', 'P'], 'Jenis kelamin harus L atau P')
        .when('claiming', {
            is: false,
            then: (schema) => schema.required('Jenis kelamin wajib dipilih')
        }),
    
    blood_type: yup
        .string()
        .oneOf(['A', 'B', 'AB', 'O', ''], 'Golongan darah tidak valid')
        .optional(),
    
    address: yup
        .string()
        .min(10, 'Alamat minimal 10 karakter')
        .max(500, 'Alamat maksimal 500 karakter')
        .when('claiming', {
            is: false,
            then: (schema) => schema.required('Alamat wajib diisi')
        }),
    
    rt_id: yup
        .number()
        .positive('RT harus dipilih')
        .when('claiming', {
            is: false,
            then: (schema) => schema.required('RT wajib dipilih')
        }),
    
    religion: yup
        .string()
        .max(50, 'Agama maksimal 50 karakter')
        .when('claiming', {
            is: false,
            then: (schema) => schema.required('Agama wajib diisi')
        }),
    
    marital_status: yup
        .string()
        .oneOf(['BELUM KAWIN', 'KAWIN', 'CERAI HIDUP', 'CERAI MATI'], 'Status perkawinan tidak valid')
        .when('claiming', {
            is: false,
            then: (schema) => schema.required('Status perkawinan wajib dipilih')
        }),
    
    occupation: yup
        .string()
        .max(100, 'Pekerjaan maksimal 100 karakter')
        .when('claiming', {
            is: false,
            then: (schema) => schema.required('Pekerjaan wajib diisi')
        }),
    
    citizenship: yup
        .string()
        .oneOf(['WNI', 'WNA'], 'Kewarganegaraan tidak valid')
        .default('WNI'),
    
    hubungan_keluarga: yup
        .string()
        .oneOf([
            'KEPALA KELUARGA', 'SUAMI', 'ISTRI', 'ANAK', 'MENANTU',
            'CUCU', 'ORANG TUA', 'MERTUA', 'FAMILI LAIN', 'PEMBANTU', 'LAINNYA'
        ], 'Hubungan keluarga tidak valid')
        .when('claiming', {
            is: false,
            then: (schema) => schema.required('Hubungan keluarga wajib dipilih')
        }),
    
    status_dalam_keluarga: yup
        .string()
        .oneOf(['KEPALA', 'ANGGOTA'], 'Status dalam keluarga tidak valid')
        .default('ANGGOTA'),
    
    status_tinggal: yup
        .string()
        .max(20, 'Status tinggal maksimal 20 karakter')
        .when('claiming', {
            is: false,
            then: (schema) => schema.required('Status tinggal wajib diisi')
        }),
    
    // FIXED: Field sesuai backend (kartu_keluarga_no bukan kkNumber)
    kartu_keluarga_no: yup
        .string()
        .matches(/^\d{16}$/, 'Nomor KK harus 16 digit angka')
        .when('claiming', {
            is: false,
            then: (schema) => schema.required('Nomor Kartu Keluarga wajib diisi')
        }),
});

const CompleteKtp = () => {
    const [mode, setMode] = useState('search');
    const [nikToCheck, setNikToCheck] = useState('');
    const [claimableData, setClaimableData] = useState(null);
    const [locationData, setLocationData] = useState({});

    const { 
        createKTP, 
        checkNikClaimability, 
        checkNikResult,
        isLoading, 
        isCheckingNik 
    } = useKtp();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(ktpSchema),
        defaultValues: {
            citizenship: 'WNI',
            status_dalam_keluarga: 'ANGGOTA',
        }
    });

    const watchedValues = watch();

    // Handle NIK check
    const handleNikCheck = async () => {
        if (!/^\d{16}$/.test(nikToCheck)) {
            toast.error('NIK harus 16 digit angka');
            return;
        }

        checkNikClaimability(nikToCheck);
    };

    // Process check result
    useEffect(() => {
        if (checkNikResult) {
            console.log('NIK check result:', checkNikResult);
            
            if (checkNikResult.data?.canClaim) {
                setClaimableData(checkNikResult.data.ktpData);
                setMode('claiming');
                setValue('nik', nikToCheck);
                toast.success('✅ NIK dapat diklaim! Data keluarga ditemukan.');
            } else {
                setClaimableData(null);
                setMode('new');
                setValue('nik', nikToCheck);
                toast('📝 NIK belum terdaftar. Silakan lengkapi data baru.', {
                    style: {
                        borderRadius: '8px',
                        background: '#0ea5e9',
                        color: '#fff',
                    },
                    duration: 4000,
                });
            }
        }
    }, [checkNikResult, setValue, nikToCheck]);

    // FIXED: Handle form submission dengan data yang sesuai backend
    const onSubmit = (data) => {
        console.log('Submitting KTP data:', data);
        
        // FIXED: Set claiming flag sesuai backend expectation
        const submissionData = {
            ...data,
            claiming: mode === 'claiming'
        };
        
        // FIXED: Pastikan rt_id ada dari location selector
        if (locationData.rt_id) {
            submissionData.rt_id = locationData.rt_id;
        }
        
        console.log('Final submission data:', submissionData);
        createKTP(submissionData);
    };

    // Handle claiming existing data
    const handleClaim = () => {
        // FIXED: Kirim data sesuai format backend untuk claiming
        createKTP({ 
            nik: claimableData.nik,
            claiming: true 
        });
    };

    // Render NIK search
    const renderNikSearch = () => (
        <div className="space-y-6">
            <div className="text-center">
                <Search className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Lengkapi Data KTP Anda
                </h3>
                <p className="text-gray-600">
                    Masukkan NIK untuk mengecek apakah data Anda sudah terdaftar sebagai anggota keluarga
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Induk Kependudukan (NIK)
                </label>
                <div className="flex space-x-3">
                    <input
                        type="text"
                        value={nikToCheck}
                        onChange={(e) => setNikToCheck(e.target.value.replace(/\D/g, '').slice(0, 16))}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Masukkan 16 digit NIK Anda"
                        maxLength="16"
                    />
                    <button
                        type="button"
                        onClick={handleNikCheck}
                        disabled={isCheckingNik || nikToCheck.length !== 16}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {isCheckingNik ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Cek...
                            </>
                        ) : (
                            <>
                                <Search className="h-4 w-4 mr-2" />
                                Cek NIK
                            </>
                        )}
                    </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    NIK adalah nomor 16 digit pada KTP Anda
                </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm">
                        <h4 className="font-medium text-blue-900 mb-1">Informasi</h4>
                        <p className="text-blue-800">
                            Jika NIK Anda sudah terdaftar sebagai anggota keluarga, Anda dapat langsung mengklaim data tersebut. 
                            Jika belum, Anda perlu mengisi data lengkap untuk registrasi baru.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render claiming interface
    const renderClaiming = () => (
        <div className="space-y-6">
            <div className="text-center">
                <UserCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Data Ditemukan!
                </h3>
                <p className="text-gray-600">
                    NIK Anda sudah terdaftar sebagai anggota keluarga. Klaim data ini untuk melanjutkan.
                </p>
            </div>

            {claimableData && (
                <ClaimableKTPCard 
                    data={claimableData} 
                    onClaim={handleClaim}
                    onCreateNew={() => setMode('new')}
                    isLoading={isLoading}
                />
            )}

            <button
                type="button"
                onClick={() => {
                    setMode('search');
                    setNikToCheck('');
                    setClaimableData(null);
                }}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-800"
            >
                ← Kembali ke pencarian NIK
            </button>
        </div>
    );

    // FIXED: Render new form dengan field yang sesuai backend
    const renderNewForm = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <Users className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Registrasi Data Baru
                </h3>
                <p className="text-gray-600">
                    Lengkapi semua data KTP Anda untuk registrasi
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* NIK Field - Read Only */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        NIK <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('nik')}
                        type="text"
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                        placeholder="16 digit NIK"
                    />
                    {errors.nik && (
                        <p className="mt-1 text-sm text-red-600">{errors.nik.message}</p>
                    )}
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* FIXED: Field name sesuai backend (full_name) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('full_name')}
                            type="text"
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.full_name ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Nama sesuai KTP"
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
                            placeholder="Kota/Kabupaten kelahiran"
                        />
                        {errors.pob && (
                            <p className="mt-1 text-sm text-red-600">{errors.pob.message}</p>
                        )}
                    </div>
                </div>

                {/* Date of Birth & Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <option value="">Pilih jenis kelamin</option>
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                        </select>
                        {errors.sex && (
                            <p className="mt-1 text-sm text-red-600">{errors.sex.message}</p>
                        )}
                    </div>
                </div>

                {/* Religion & Blood Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <option value="">Pilih agama</option>
                            <option value="Islam">Islam</option>
                            <option value="Kristen">Kristen</option>
                            <option value="Katolik">Katolik</option>
                            <option value="Hindu">Hindu</option>
                            <option value="Buddha">Buddha</option>
                            <option value="Konghucu">Konghucu</option>
                        </select>
                        {errors.religion && (
                            <p className="mt-1 text-sm text-red-600">{errors.religion.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Golongan Darah
                        </label>
                        <select
                            {...register('blood_type')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Pilih golongan darah</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="AB">AB</option>
                            <option value="O">O</option>
                        </select>
                        {errors.blood_type && (
                            <p className="mt-1 text-sm text-red-600">{errors.blood_type.message}</p>
                        )}
                    </div>
                </div>

                {/* Marital Status & Occupation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <option value="">Pilih status perkawinan</option>
                            <option value="BELUM KAWIN">Belum Kawin</option>
                            <option value="KAWIN">Kawin</option>
                            <option value="CERAI HIDUP">Cerai Hidup</option>
                            <option value="CERAI MATI">Cerai Mati</option>
                        </select>
                        {errors.marital_status && (
                            <p className="mt-1 text-sm text-red-600">{errors.marital_status.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pekerjaan <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('occupation')}
                            type="text"
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.occupation ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Pekerjaan sesuai KTP"
                        />
                        {errors.occupation && (
                            <p className="mt-1 text-sm text-red-600">{errors.occupation.message}</p>
                        )}
                    </div>
                </div>

                {/* Family Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hubungan Keluarga <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register('hubungan_keluarga')}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.hubungan_keluarga ? 'border-red-300' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Pilih hubungan keluarga</option>
                            <option value="KEPALA KELUARGA">Kepala Keluarga</option>
                            <option value="SUAMI">Suami</option>
                            <option value="ISTRI">Istri</option>
                            <option value="ANAK">Anak</option>
                            <option value="MENANTU">Menantu</option>
                            <option value="CUCU">Cucu</option>
                            <option value="ORANG TUA">Orang Tua</option>
                            <option value="MERTUA">Mertua</option>
                            <option value="FAMILI LAIN">Famili Lain</option>
                            <option value="PEMBANTU">Pembantu</option>
                            <option value="LAINNYA">Lainnya</option>
                        </select>
                        {errors.hubungan_keluarga && (
                            <p className="mt-1 text-sm text-red-600">{errors.hubungan_keluarga.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status Tinggal <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register('status_tinggal')}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.status_tinggal ? 'border-red-300' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Pilih status tinggal</option>
                            <option value="TETAP">Tetap</option>
                            <option value="SEMENTARA">Sementara</option>
                            <option value="KONTRAK">Kontrak</option>
                        </select>
                        {errors.status_tinggal && (
                            <p className="mt-1 text-sm text-red-600">{errors.status_tinggal.message}</p>
                        )}
                    </div>
                </div>

                {/* Address */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat Lengkap <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        {...register('address')}
                        rows={3}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.address ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Alamat lengkap sesuai KTP"
                    />
                    {errors.address && (
                        <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                    )}
                </div>

                {/* FIXED: Nomor KK field name sesuai backend */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Kartu Keluarga <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('kartu_keluarga_no')}
                        type="text"
                        maxLength="16"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.kartu_keluarga_no ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="16 digit nomor Kartu Keluarga"
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                            setValue('kartu_keluarga_no', value);
                        }}
                    />
                    {errors.kartu_keluarga_no && (
                        <p className="mt-1 text-sm text-red-600">{errors.kartu_keluarga_no.message}</p>
                    )}
                </div>

                {/* Location Selector */}
                <LocationSelector
                    onLocationChange={(locationData) => {
                        setLocationData(locationData);
                        if (locationData.rt_id) {
                            setValue('rt_id', locationData.rt_id);
                        }
                    }}
                    error={errors.rt_id}
                />

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                        type="button"
                        onClick={() => {
                            setMode('search');
                            setNikToCheck('');
                            setClaimableData(null);
                            reset();
                        }}
                        className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                        ← Kembali
                    </button>
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Simpan Data KTP
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );

    // Main render logic
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-2">
                                    Lengkapi Data KTP
                                </h1>
                                <p className="text-blue-100">
                                    Kelola data Kartu Tanda Penduduk Anda
                                </p>
                            </div>
                            <div className="hidden sm:block">
                                <div className="flex items-center space-x-4 text-blue-100">
                                    <div className="text-center">
                                        <Search className="h-8 w-8 mx-auto mb-1" />
                                        <div className="text-xs">Cek NIK</div>
                                    </div>
                                    <div className="h-8 w-px bg-blue-300"></div>
                                    <div className="text-center">
                                        <UserCheck className="h-8 w-8 mx-auto mb-1" />
                                        <div className="text-xs">Verifikasi</div>
                                    </div>
                                    <div className="h-8 w-px bg-blue-300"></div>
                                    <div className="text-center">
                                        <Users className="h-8 w-8 mx-auto mb-1" />
                                        <div className="text-xs">Lengkapi</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8">
                        {mode === 'search' && renderNikSearch()}
                        {mode === 'claiming' && renderClaiming()}
                        {mode === 'new' && renderNewForm()}
                    </div>
                </div>

                {/* Help Section */}
                <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Bantuan Pengisian
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                                📋 Data yang Diperlukan
                            </h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• NIK (16 digit)</li>
                                <li>• Nama lengkap sesuai KTP</li>
                                <li>• Tempat dan tanggal lahir</li>
                                <li>• Alamat lengkap</li>
                                <li>• Nomor Kartu Keluarga</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                                ❓ Butuh Bantuan?
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                                Jika mengalami kesulitan dalam pengisian form, 
                                silakan hubungi petugas kelurahan setempat.
                            </p>
                            <Link 
                                to="/help" 
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Panduan Lengkap →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompleteKtp;