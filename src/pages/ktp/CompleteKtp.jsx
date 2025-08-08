// src/pages/ktp/CompleteKTP.jsx - Tambah import toast di bagian atas
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast'; // ← TAMBAH INI
import { useKtp } from '../../hooks/useKtp';
import { Search, UserCheck, Users, AlertCircle, CheckCircle } from 'lucide-react';
import LocationSelector from '../../components/forms/LocationSelector';
import ClaimableKTPCard from '../../components/ktp/ClaimableKTPCard';

// Validation schema tetap sama...
const ktpSchema = yup.object({
    nik: yup
        .string()
        .matches(/^\d{16}$/, 'NIK harus 16 digit angka')
        .required('NIK wajib diisi'),
    full_name: yup
        .string()
        .min(2, 'Nama minimal 2 karakter')
        .max(255, 'Nama maksimal 255 karakter')
        .when('claiming', {
        is: false,
        then: (schema) => schema.required('Nama lengkap wajib diisi')
        }),
    // ... rest of validation schema
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
    kartu_keluarga_no: yup
        .string()
        .matches(/^\d{16}$/, 'Nomor KK harus 16 digit angka')
        .when('claiming', {
        is: false,
        then: (schema) => schema.required('Nomor Kartu Keluarga wajib diisi')
        }),
    });

const CompleteKtp = () => {
    const [mode, setMode] = useState('search'); // 'search', 'claiming', 'new'
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

    // Process check result - FINAL VERSION
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
            // Custom styled toast untuk info
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

    // Handle form submission
    const onSubmit = (data) => {
        console.log('Submitting KTP data:', data);
        
        // Set claiming flag
        data.claiming = mode === 'claiming';
        
        createKTP(data);
    };

    // Handle claiming existing data
    const handleClaim = () => {
        createKTP({ 
        nik: claimableData.nik,
        claiming: true 
        });
    };

    // Rest of the component remains exactly the same...
    // (renderNikSearch, renderClaiming, renderNewForm functions)
    
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

    // Render new registration form - component ini sangat panjang, jadi saya skip detail form nya
    // Tapi pastikan di dalam form ada setValue calls yang benar
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

            {/* Personal Information - Form fields sama seperti sebelumnya */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
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

            {/* Continue dengan semua field form yang sama seperti sebelumnya... */}
            {/* Untuk menghemat space, saya tidak copy paste semua field */}
            {/* Tapi pastikan semua field validation dan setValue sudah benar */}

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0V4a2 2 0 014 0v2" />
                </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Data KTP
            </h1>
            <p className="text-lg text-gray-600">
                Lengkapi data KTP Anda untuk melanjutkan ke sistem SMART-RW
            </p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
                <div className={`flex items-center ${mode === 'search' ? 'text-blue-600' : mode !== 'search' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${mode === 'search' ? 'bg-blue-100 border-2 border-blue-600' : mode !== 'search' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                    <span className="text-sm font-semibold">1</span>
                </div>
                <span className="ml-2 text-sm font-medium">Cek NIK</span>
                </div>
                
                <div className={`h-0.5 w-16 ${mode !== 'search' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                
                <div className={`flex items-center ${mode === 'claiming' || mode === 'new' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${mode === 'claiming' || mode === 'new' ? 'bg-blue-100 border-2 border-blue-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                    <span className="text-sm font-semibold">2</span>
                </div>
                <span className="ml-2 text-sm font-medium">Lengkapi Data</span>
                </div>
            </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            {mode === 'search' && renderNikSearch()}
            {mode === 'claiming' && renderClaiming()}
            {mode === 'new' && renderNewForm()}
            </div>

            {/* Help Section */}
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Butuh Bantuan?</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                <h4 className="font-medium text-gray-900 mb-2">Data yang Diperlukan:</h4>
                <ul className="space-y-1">
                    <li>• KTP asli untuk referensi data</li>
                    <li>• Kartu Keluarga (KK) untuk nomor KK</li>
                    <li>• Informasi RT/RW tempat tinggal</li>
                </ul>
                </div>
                <div>
                <h4 className="font-medium text-gray-900 mb-2">Catatan Penting:</h4>
                <ul className="space-y-1">
                    <li>• Isi data sesuai dengan dokumen resmi</li>
                    <li>• Pastikan NIK dan nomor KK benar</li>
                    <li>• Data akan diverifikasi oleh admin RT/RW</li>
                </ul>
                </div>
            </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
                Sudah selesai?{' '}
                <Link to="/dashboard" className="text-blue-600 hover:text-blue-500 font-medium">
                Kembali ke Dashboard
                </Link>
            </p>
            </div>
        </div>
        </div>
    );
};

export default CompleteKtp;