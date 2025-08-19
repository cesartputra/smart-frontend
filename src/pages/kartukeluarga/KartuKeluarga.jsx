// src/pages/kartuKeluarga/KartuKeluarga.jsx
import { useState } from 'react';
import { 
    Users, 
    UserPlus, 
    Edit3, 
    Trash2, 
    Eye, 
    Home, 
    Calendar,
    MapPin,
    Phone,
    CreditCard,
    AlertTriangle,
    CheckCircle,
    Plus
} from 'lucide-react';
import { useKartuKeluarga } from '../../hooks/useKartuKeluarga';
import AddFamilyMemberModal from '../../components/kartukeluarga/AddFamilyMemberModal';
import EditFamilyMemberModal from '../../components/kartukeluarga/EditFamilyMemberModal';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';

const KartuKeluarga = () => {
    const { 
        familyData, 
        familyLoading: isFamilyLoading, 
        familyError,
        deleteFamilyMember,
        isDeletingMember,
        canDeleteMember,
        addFamilyMember,
        updateFamilyMember
    } = useKartuKeluarga();

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [deletingMember, setDeletingMember] = useState(null);

    // Handle delete member
    const handleDeleteMember = (member) => {
        if (!canDeleteMember(member)) {
            return;
        }
        setDeletingMember(member);
    };

    const confirmDeleteMember = () => {
        if (deletingMember) {
            deleteFamilyMember(deletingMember.id);
            setDeletingMember(null);
        }
    };

    // Loading state
    if (isFamilyLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat data kartu keluarga...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (familyError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Gagal Memuat Data</h2>
                    <p className="text-gray-600 mb-4">
                        Terjadi kesalahan saat memuat data kartu keluarga Anda.
                    </p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    // No family data
    if (!familyData || !familyData.kk) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Data Keluarga</h2>
                    <p className="text-gray-600">
                        Anda belum terdaftar dalam kartu keluarga manapun. 
                        Silakan lengkapi data KTP Anda terlebih dahulu.
                    </p>
                </div>
            </div>
        );
    }

    const { kk, members } = familyData;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Kartu Keluarga</h1>
                                <p className="text-sm text-gray-600">Kelola data anggota keluarga Anda</p>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Anggota
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* KK Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center">
                            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                <CreditCard className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Informasi Kartu Keluarga</h2>
                                <p className="text-sm text-gray-600">No. KK: {kk.no}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Aktif
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Kepala Keluarga */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                Kepala Keluarga
                            </label>
                            <p className="text-sm font-medium text-gray-900">{kk.kepala_keluarga_nama}</p>
                        </div>

                        {/* Alamat */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                Alamat
                            </label>
                            <div className="flex items-start">
                                <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-gray-600">
                                    <p>{kk.address}</p>
                                    <p className="text-xs text-gray-500">
                                        RT {kk.rt_no?.toString().padStart(2, '0')} / 
                                        RW {kk.rw_no?.toString().padStart(2, '0')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Jumlah Anggota */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                Jumlah Anggota
                            </label>
                            <div className="flex items-center">
                                <Users className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm font-medium text-gray-900">
                                    {members.length} Orang
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Members List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Anggota Keluarga</h3>
                        <p className="text-sm text-gray-600">Daftar seluruh anggota dalam kartu keluarga ini</p>
                    </div>

                    <div className="p-6">
                        {members.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h4 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Anggota</h4>
                                <p className="text-gray-600 mb-4">
                                    Tambahkan anggota keluarga untuk melengkapi data KK
                                </p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Tambah Anggota Pertama
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {members.map((member) => (
                                    <div 
                                        key={member.id} 
                                        className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
                                            member.is_kepala_keluarga 
                                                ? 'border-blue-200 bg-blue-50' 
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center">
                                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 ${
                                                    member.is_kepala_keluarga 
                                                        ? 'bg-blue-100' 
                                                        : member.has_user_account 
                                                        ? 'bg-green-100' 
                                                        : 'bg-gray-100'
                                                }`}>
                                                    <Users className={`h-5 w-5 ${
                                                        member.is_kepala_keluarga 
                                                            ? 'text-blue-600' 
                                                            : member.has_user_account 
                                                            ? 'text-green-600' 
                                                            : 'text-gray-600'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{member.full_name}</h4>
                                                    <p className="text-xs text-gray-500">NIK: {member.nik}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                {member.is_kepala_keluarga && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        Kepala KK
                                                    </span>
                                                )}
                                                {member.has_user_account && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Punya Akun
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                {member.pob}, {new Date(member.dob).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Users className="h-4 w-4 mr-2" />
                                                {member.sex === 'L' ? 'Laki-laki' : 'Perempuan'} • {member.hubungan_keluarga}
                                            </div>

                                            {member.phone && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Phone className="h-4 w-4 mr-2" />
                                                    {member.phone}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => setEditingMember(member)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                                title="Edit anggota"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            
                                            {canDeleteMember(member) && (
                                                <button
                                                    onClick={() => handleDeleteMember(member)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                                    title="Hapus anggota"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}

                                            {!canDeleteMember(member) && !member.is_kepala_keluarga && (
                                                <div className="p-2 text-gray-400" title="Tidak dapat dihapus - sudah memiliki akun">
                                                    <Trash2 className="h-4 w-4" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showAddModal && (
                <AddFamilyMemberModal
                    onClose={() => setShowAddModal(false)}
                    kkData={kk}
                />
            )}

            {editingMember && (
                <EditFamilyMemberModal
                    member={editingMember}
                    onClose={() => setEditingMember(null)}
                />
            )}

            {deletingMember && (
                <DeleteConfirmModal
                    isOpen={true}
                    onClose={() => setDeletingMember(null)}
                    onConfirm={confirmDeleteMember}
                    title="Hapus Anggota Keluarga"
                    message={`Apakah Anda yakin ingin menghapus ${deletingMember.full_name} dari kartu keluarga? Tindakan ini tidak dapat dibatalkan.`}
                    isLoading={isDeletingMember}
                />
            )}
        </div>
    );
};

export default KartuKeluarga;