// src/pages/profile/Profile.jsx - Refactored User Profile Page
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useUserDetails } from '../../hooks/useUserDetails';
import { useUserKtp } from '../../hooks/useUserKtp';
import { useRole } from '../../hooks/useRole';
import SignatureCanvas from '../../components/forms/SignatureCanvas';
import { 
    User, 
    Phone, 
    FileSignature, 
    CheckCircle,
    Edit3,
    Save,
    X,
    Mail,
    Calendar,
    MapPin,
    Shield,
    Camera,
    Upload,
    Eye,
    EyeOff,
    Settings,
    Bell,
    Lock,
    ArrowLeft,
    CreditCard,
    Users,
    Clock,
    AlertCircle
} from 'lucide-react';

// Validation schemas
const personalInfoSchema = yup.object({
    phone_number: yup
        .string()
        .matches(/^(\+62|62|0)[0-9]{9,13}$/, 'Format nomor telepon Indonesia tidak valid')
        .required('Nomor telepon wajib diisi'),
});

const signatureSchema = yup.object({
    signature_url: yup
        .string()
        .required('Tanda tangan digital wajib diisi')
});

// Memoized Profile Header Component
const ProfileHeader = ({ user, isEditing, onToggleEdit, onSave, isSaving }) => {
    const getInitials = useCallback((name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }, []);

    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="h-20 w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {user?.profile_picture ? (
                                <img 
                                    src={user.profile_picture} 
                                    alt="Profile" 
                                    className="h-20 w-20 rounded-full object-cover"
                                />
                            ) : (
                                getInitials(user?.full_name)
                            )}
                        </div>
                        <button className="absolute bottom-0 right-0 h-6 w-6 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors">
                            <Camera className="h-3 w-3 text-gray-600" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">
                            {user?.full_name || 'Nama Pengguna'}
                        </h1>
                        <p className="text-blue-100 text-sm mb-2">
                            {user?.email}
                        </p>
                        <div className="flex items-center space-x-4 text-blue-100 text-xs">
                            <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Bergabung {new Date(user?.created_at || Date.now()).toLocaleDateString('id-ID', { 
                                    month: 'long', 
                                    year: 'numeric' 
                                })}
                            </span>
                            <span className="flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Terverifikasi
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={onToggleEdit}
                                disabled={isSaving}
                                className="flex items-center px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors duration-200 disabled:opacity-50"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Batal
                            </button>
                            <button
                                onClick={onSave}
                                disabled={isSaving}
                                className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Simpan
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onToggleEdit}
                            className="flex items-center px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors duration-200"
                        >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Profil
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Memoized Info Card Component
const InfoCard = ({ icon: Icon, title, children, className = "" }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <div className="flex items-center mb-4">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {children}
    </div>
);

// Memoized Role Badge Component
const RoleBadge = ({ role }) => {
    const roleConfig = {
        'SUPER ADMIN': { color: 'bg-red-100 text-red-800', icon: Shield },
        'ADMIN': { color: 'bg-orange-100 text-orange-800', icon: Settings },
        'KETUA RW': { color: 'bg-purple-100 text-purple-800', icon: Shield },
        'KETUA RT': { color: 'bg-blue-100 text-blue-800', icon: Shield },
        'WARGA': { color: 'bg-green-100 text-green-800', icon: User }
    };

    const config = roleConfig[role.role_name] || roleConfig['WARGA'];
    const IconComponent = config.icon;

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
            <IconComponent className="h-4 w-4 mr-1" />
            {role.role_name}
            {role.rt_no && ` - RT ${role.rt_no}`}
            {role.rw_no && ` - RW ${role.rw_no}`}
        </span>
    );
};

// Main Profile Component
const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [signatureData, setSignatureData] = useState(null);
    const [activeTab, setActiveTab] = useState('personal');

    const { user, logout } = useAuth();
    const { userDetails, updateUserDetails, isUpdating } = useUserDetails();
    const { ktpData } = useUserKtp();
    const { myRoles, myRolesLoading } = useRole();

    // Forms for different sections
    const personalForm = useForm({
        resolver: yupResolver(personalInfoSchema),
        mode: 'onChange'
    });

    const signatureForm = useForm({
        resolver: yupResolver(signatureSchema)
    });

    // Load user data
    useEffect(() => {
        if (userDetails) {
            personalForm.reset({
                phone_number: userDetails.phone_number || ''
            });
        }
        if (userDetails?.signature_url) {
            setSignatureData({ dataURL: userDetails.signature_url });
            signatureForm.setValue('signature_url', userDetails.signature_url);
        }
    }, [userDetails, personalForm, signatureForm]);

    // Handle form submissions
    const handleSavePersonal = useCallback(async (data) => {
        try {
            await updateUserDetails(data);
            toast.success('Informasi personal berhasil diperbarui');
            setEditingSection(null);
        } catch (error) {
            toast.error('Gagal memperbarui informasi personal');
        }
    }, [updateUserDetails]);

    const handleSaveSignature = useCallback(async (data) => {
        try {
            await updateUserDetails(data);
            toast.success('Tanda tangan berhasil diperbarui');
            setEditingSection(null);
        } catch (error) {
            toast.error('Gagal memperbarui tanda tangan');
        }
    }, [updateUserDetails]);

    // Handle signature change
    const handleSignatureChange = useCallback((signatureInfo) => {
        if (!signatureInfo) {
            setSignatureData(null);
            signatureForm.setValue('signature_url', '');
            return;
        }

        // Mock upload - replace with actual upload logic
        const mockUrl = `https://storage.smartrw.com/signatures/${user?.id}_${Date.now()}.png`;
        setSignatureData(signatureInfo);
        signatureForm.setValue('signature_url', mockUrl);
    }, [user?.id, signatureForm]);

    // Computed values
    const completionPercentage = useMemo(() => {
        let completed = 0;
        const total = 4;
        
        if (user?.email) completed++;
        if (ktpData) completed++;
        if (userDetails?.phone_number) completed++;
        if (userDetails?.signature_url) completed++;
        
        return Math.round((completed / total) * 100);
    }, [user, ktpData, userDetails]);

    const tabs = [
        { id: 'personal', label: 'Informasi Personal', icon: User },
        { id: 'security', label: 'Keamanan', icon: Lock },
        { id: 'notifications', label: 'Notifikasi', icon: Bell },
        { id: 'roles', label: 'Role & Akses', icon: Shield }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back Button */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-4">
                        <button 
                            onClick={() => window.history.back()}
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali ke Dashboard
                        </button>
                    </div>
                </div>
            </div>

            {/* Profile Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto">
                    <ProfileHeader 
                        user={user}
                        isEditing={isEditing}
                        onToggleEdit={() => setIsEditing(!isEditing)}
                        onSave={() => {
                            if (editingSection === 'personal') {
                                personalForm.handleSubmit(handleSavePersonal)();
                            } else if (editingSection === 'signature') {
                                signatureForm.handleSubmit(handleSaveSignature)();
                            }
                        }}
                        isSaving={isUpdating}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan</h3>
                            <nav className="space-y-2">
                                {tabs.map(tab => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                                activeTab === tab.id
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4 mr-3" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>

                            {/* Completion Status */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Kelengkapan Profil</span>
                                    <span className="text-sm font-bold text-blue-600">{completionPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${completionPercentage}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {completionPercentage === 100 ? 'Profil lengkap!' : 'Lengkapi profil untuk akses penuh'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Personal Information Tab */}
                        {activeTab === 'personal' && (
                            <>
                                {/* Contact Information */}
                                <InfoCard icon={Phone} title="Informasi Kontak">
                                    <form onSubmit={personalForm.handleSubmit(handleSavePersonal)}>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email
                                                </label>
                                                <div className="flex items-center">
                                                    <Mail className="h-4 w-4 text-gray-400 mr-3" />
                                                    <span className="text-gray-900">{user?.email}</span>
                                                    <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Email terverifikasi</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nomor Telepon
                                                </label>
                                                {editingSection === 'personal' ? (
                                                    <div className="flex space-x-3">
                                                        <div className="flex-1">
                                                            <input
                                                                {...personalForm.register('phone_number')}
                                                                type="tel"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="+6281234567890"
                                                            />
                                                            {personalForm.formState.errors.phone_number && (
                                                                <p className="text-red-600 text-xs mt-1">
                                                                    {personalForm.formState.errors.phone_number.message}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <button
                                                            type="submit"
                                                            disabled={isUpdating}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                                        >
                                                            Simpan
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingSection(null)}
                                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                                        >
                                                            Batal
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <Phone className="h-4 w-4 text-gray-400 mr-3" />
                                                            <span className="text-gray-900">
                                                                {userDetails?.phone_number || 'Belum diatur'}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => setEditingSection('personal')}
                                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                </InfoCard>

                                {/* KTP Information */}
                                {ktpData && (
                                    <InfoCard icon={CreditCard} title="Informasi KTP">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
                                                <p className="text-gray-900">{ktpData.nik?.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-****-****-$4')}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                                <p className="text-gray-900">{ktpData.full_name}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Tempat, Tanggal Lahir</label>
                                                <p className="text-gray-900">
                                                    {ktpData.pob}, {new Date(ktpData.dob).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                                                <p className="text-gray-900">{ktpData.sex === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                                            <div className="flex items-start">
                                                <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                                <p className="text-gray-900 text-sm">{ktpData.address}</p>
                                            </div>
                                        </div>
                                    </InfoCard>
                                )}

                                {/* Digital Signature */}
                                <InfoCard icon={FileSignature} title="Tanda Tangan Digital">
                                    {editingSection === 'signature' ? (
                                        <form onSubmit={signatureForm.handleSubmit(handleSaveSignature)}>
                                            <div className="space-y-4">
                                                <SignatureCanvas
                                                    onSignatureChange={handleSignatureChange}
                                                    existingSignature={signatureData?.dataURL}
                                                />
                                                <div className="flex space-x-3">
                                                    <button
                                                        type="submit"
                                                        disabled={isUpdating || !signatureForm.watch('signature_url')}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                                    >
                                                        Simpan Tanda Tangan
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingSection(null)}
                                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                                    >
                                                        Batal
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="space-y-4">
                                            {signatureData?.dataURL ? (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <img 
                                                            src={signatureData.dataURL} 
                                                            alt="Tanda tangan"
                                                            className="h-16 w-auto border border-gray-200 rounded-lg"
                                                        />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">Tanda tangan tersimpan</p>
                                                            <p className="text-xs text-gray-500">Digunakan untuk dokumen resmi</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setEditingSection('signature')}
                                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                    >
                                                        Ubah
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <FileSignature className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                    <p className="text-gray-500 mb-4">Belum ada tanda tangan digital</p>
                                                    <button
                                                        onClick={() => setEditingSection('signature')}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                    >
                                                        Tambah Tanda Tangan
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </InfoCard>
                            </>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <InfoCard icon={Lock} title="Keamanan Akun">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Password</h4>
                                            <p className="text-sm text-gray-500">Terakhir diubah 30 hari yang lalu</p>
                                        </div>
                                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                            Ubah Password
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Sesi Aktif</h4>
                                            <p className="text-sm text-gray-500">Kelola perangkat yang terhubung</p>
                                        </div>
                                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                            Lihat Sesi
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between py-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Logout dari Semua Perangkat</h4>
                                            <p className="text-sm text-gray-500">Keluar dari semua perangkat kecuali yang ini</p>
                                        </div>
                                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                                            Logout Semua
                                        </button>
                                    </div>
                                </div>
                            </InfoCard>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <InfoCard icon={Bell} title="Pengaturan Notifikasi">
                                <div className="space-y-4">
                                    {[
                                        { id: 'email_notifications', label: 'Notifikasi Email', description: 'Terima update melalui email' },
                                        { id: 'sms_notifications', label: 'Notifikasi SMS', description: 'Terima update melalui SMS' },
                                        { id: 'push_notifications', label: 'Push Notifications', description: 'Notifikasi browser' },
                                        { id: 'surat_updates', label: 'Update Surat Pengantar', description: 'Notifikasi status pengajuan' }
                                    ].map(setting => (
                                        <div key={setting.id} className="flex items-center justify-between py-3">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900">{setting.label}</h4>
                                                <p className="text-sm text-gray-500">{setting.description}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </InfoCard>
                        )}

                        {/* Roles Tab */}
                        {activeTab === 'roles' && (
                            <InfoCard icon={Shield} title="Role & Hak Akses">
                                {myRolesLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : myRoles && myRoles.length > 0 ? (
                                    <div className="space-y-4">
                                        {myRoles.map((role, index) => (
                                            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                                                <div className="flex items-center space-x-3">
                                                    <RoleBadge role={role} />
                                                    <div>
                                                        {role.rt_no && (
                                                            <p className="text-xs text-gray-500">
                                                                RT {role.rt_no} - RW {role.rw_no}
                                                            </p>
                                                        )}
                                                        {role.kelurahan_name && (
                                                            <p className="text-xs text-gray-500">
                                                                {role.kelurahan_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 text-gray-400 mr-1" />
                                                    <span className="text-xs text-gray-500">
                                                        Aktif sejak {new Date(role.assigned_at || Date.now()).toLocaleDateString('id-ID')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-start">
                                                <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <h4 className="text-sm font-medium text-blue-900 mb-1">
                                                        Tentang Role & Hak Akses
                                                    </h4>
                                                    <p className="text-sm text-blue-700">
                                                        Role menentukan fitur dan data yang dapat Anda akses dalam sistem. 
                                                        Jika ada pertanyaan tentang role Anda, hubungi administrator sistem.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 mb-2">Belum ada role yang diberikan</p>
                                        <p className="text-sm text-gray-400">
                                            Role akan diberikan oleh administrator sesuai kebutuhan
                                        </p>
                                    </div>
                                )}
                            </InfoCard>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button 
                            onClick={() => window.location.href = '/surat-pengantar'}
                            className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            <FileSignature className="h-5 w-5 text-gray-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">Ajukan Surat Pengantar</span>
                        </button>
                        
                        <button 
                            onClick={() => window.location.href = '/kartu-keluarga'}
                            className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            <Users className="h-5 w-5 text-gray-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">Kelola Kartu Keluarga</span>
                        </button>
                        
                        <button 
                            onClick={() => {
                                if (window.confirm('Apakah Anda yakin ingin keluar?')) {
                                    logout();
                                }
                            }}
                            className="flex items-center justify-center py-3 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Account Statistics */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow duration-200">
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <FileSignature className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">0</p>
                        <p className="text-sm text-gray-500">Surat Pengantar</p>
                        <p className="text-xs text-gray-400 mt-1">Total pengajuan</p>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow duration-200">
                        <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{ktpData?.family_members_count || 0}</p>
                        <p className="text-sm text-gray-500">Anggota Keluarga</p>
                        <p className="text-xs text-gray-400 mt-1">Terdaftar dalam KK</p>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow duration-200">
                        <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <Shield className="h-6 w-6 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{myRoles?.length || 0}</p>
                        <p className="text-sm text-gray-500">Role Aktif</p>
                        <p className="text-xs text-gray-400 mt-1">Hak akses sistem</p>
                    </div>
                </div>

                {/* Activity Log */}
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h3>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Profil berhasil dilengkapi</p>
                                <p className="text-xs text-gray-500">Hari ini</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Mail className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Email berhasil diverifikasi</p>
                                <p className="text-xs text-gray-500">2 hari yang lalu</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 py-3">
                            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Akun berhasil didaftarkan</p>
                                <p className="text-xs text-gray-500">1 minggu yang lalu</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;