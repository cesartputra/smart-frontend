// src/components/ktp/ClaimableKTPCard.jsx
import { Calendar, MapPin, Users, CreditCard, CheckCircle, UserPlus } from 'lucide-react';

const ClaimableKtpCard = ({ data, onClaim, onCreateNew, isLoading }) => {
    if (!data) return null;

    return (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Data KTP Ditemukan</h3>
                <p className="text-sm text-gray-600">Anggota keluarga terdaftar</p>
            </div>
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            Dapat diklaim
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Personal Info */}
            <div className="space-y-3">
            <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Identitas</p>
                <p className="text-sm font-medium text-gray-900">{data.full_name}</p>
                <p className="text-xs text-gray-600">NIK: {data.nik}</p>
            </div>

            <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {data.pob}, {new Date(data.dob).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
                })}
            </div>

            <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                {data.sex === 'L' ? 'Laki-laki' : 'Perempuan'} • {data.religion}
            </div>
            </div>

            {/* Address & Family Info */}
            <div className="space-y-3">
            <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Alamat</p>
                <div className="flex items-start text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                    <p>{data.address}</p>
                    <p className="text-xs">
                    RT {data.rt?.number.toString().padStart(2, '0')} / 
                    RW {data.rt?.rw?.number.toString().padStart(2, '0')}
                    </p>
                </div>
                </div>
            </div>

            <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Keluarga</p>
                <p className="text-sm text-gray-600">{data.hubungan_keluarga}</p>
                <p className="text-xs text-gray-500">KK: {data.kartu_keluarga_no}</p>
            </div>
            </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
            <button
            onClick={onClaim}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
            {isLoading ? (
                <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Mengklaim...
                </>
            ) : (
                <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Klaim Data Ini
                </>
            )}
            </button>

            <button
            onClick={onCreateNew}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            >
            <UserPlus className="h-5 w-5 mr-2" />
            Buat Data Baru
            </button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
            <strong>Dengan mengklaim data ini:</strong> Anda akan terhubung dengan data keluarga yang sudah ada. 
            Data pribadi Anda akan sesuai dengan yang tercatat dalam sistem.
            </p>
        </div>
        </div>
    );
};

export default ClaimableKtpCard;