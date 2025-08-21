// src/pages/Dashboard.jsx - SIMPLE DEBUG VERSION
import { LogOut, User, Settings, Bell, Home, Shield, FileText, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../store/authStore';
import NavigationCard from '../components/common/NavigationCard';
import { MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';

const Dashboard = () => {
    const { logout, isLoggingOut } = useAuth();
    const { user } = useAuthStore();
    const [pendingRTCount, setPendingRTCount] = useState(0);
    const [userRoles, setUserRoles] = useState([]);
    const [isKetuaRT, setIsKetuaRT] = useState(false);
    const [pendingRWCount, setPendingRWCount] = useState(0);
    const [isKetuaRW, setIsKetuaRW] = useState(false);

    // Direct API call untuk get roles - bypass hook untuk debug
    const { data: rolesData, isLoading: rolesLoading } = useQuery({
        queryKey: ['debug-my-roles'],
        queryFn: async () => {
            console.log('🔄 Direct API call to get roles...');
            try {
                const response = await api.get('/api/user-roles/my-roles');
                console.log('📊 Direct API response:', response.data);
                return response.data;
            } catch (error) {
                console.error('❌ Direct API error:', error);
                throw error;
            }
        },
        onSuccess: (data) => {
            console.log('✅ Roles data received:', data);
        }
    });

    // Extract roles dan check Ketua RW
    useEffect(() => {
        if (rolesData) {
            console.log('🔍 Processing roles data:', rolesData);
            
            let extractedRoles = [];
            
            // Handle different response structures
            if (rolesData.success && rolesData.data && rolesData.data.roles) {
                extractedRoles = rolesData.data.roles;
            } else if (rolesData.roles) {
                extractedRoles = rolesData.roles;
            } else if (Array.isArray(rolesData)) {
                extractedRoles = rolesData;
            }
            
            setUserRoles(extractedRoles);
            
            // Check for KETUA RT
            const hasKetuaRT = extractedRoles.some(role => role.role_name === 'KETUA RT');
            setIsKetuaRT(hasKetuaRT);
            
            // Check for KETUA RW
            const hasKetuaRW = extractedRoles.some(role => {
                const isKetuaRW = role.role_name === 'KETUA RW';
                console.log(`🏛️ Checking role "${role.role_name}" === "KETUA RW": ${isKetuaRW}`);
                return isKetuaRW;
            });
            
            console.log(`🎯 Final isKetuaRW result: ${hasKetuaRW}`);
            setIsKetuaRW(hasKetuaRW);
        }
    }, [rolesData]);

    // Get pending RT count jika user adalah Ketua RT
    const { data: pendingRTData } = useQuery({
        queryKey: ['debug-pending-rt'],
        queryFn: async () => {
            console.log('🔄 Fetching pending RT count...');
            try {
                const response = await api.get('/api/surat-pengantar/rt/pending?limit=1');
                console.log('📊 Pending RT response:', response.data);
                return response.data;
            } catch (error) {
                console.error('❌ Pending RT error:', error);
                return { pagination: { total: 0 } };
            }
        },
        enabled: isKetuaRT,
        refetchInterval: 30000
    });

    useEffect(() => {
        if (pendingRTData?.pagination?.total) {
            setPendingRTCount(pendingRTData.pagination.total);
        }
    }, [pendingRTData]);

    // Get pending RW count jika user adalah Ketua RW
    const { data: pendingRWData } = useQuery({
        queryKey: ['debug-pending-rw'],
        queryFn: async () => {
            console.log('🔄 Fetching pending RW count...');
            try {
                const response = await api.get('/api/surat-pengantar/rw/pending?limit=1');
                console.log('📊 Pending RW response:', response.data);
                return response.data;
            } catch (error) {
                console.error('❌ Pending RW error:', error);
                return { pagination: { total: 0 } };
            }
        },
        enabled: isKetuaRW,
        refetchInterval: 30000
    });

    useEffect(() => {
        if (pendingRWData?.pagination?.total) {
            setPendingRWCount(pendingRWData.pagination.total);
        }
    }, [pendingRWData]);

    const handleLogout = () => {
        if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
            logout();
        }
    };

    // Get RT info dari roles
    const rtInfo = userRoles.find(role => role.role_name === 'KETUA RT');

    // Update user info untuk include RW role
    const rwInfo = userRoles.find(role => role.role_name === 'KETUA RW');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* DEBUGGING INFO */}
            {/* <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
                <p className="font-bold">🐛 DEBUG INFO:</p>
                <p>• Raw rolesData: {JSON.stringify(rolesData, null, 2)}</p>
                <p>• Extracted userRoles: {JSON.stringify(userRoles?.map(r => r.role_name))}</p>
                <p>• isKetuaRT: {isKetuaRT.toString()}</p>
                <p>• pendingRTCount: {pendingRTCount}</p>
                <p>• rtInfo: {JSON.stringify(rtInfo)}</p>
            </div> */}

            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                <Home className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">SMART-RW</h1>
                                <p className="text-xs text-gray-500">Sistem Manajemen RT-RW</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                        {/* Update notification bell untuk include RW notifications */}
                            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative">
                                <Bell className="h-5 w-5" />
                                {((isKetuaRT && pendingRTCount > 0) || (isKetuaRW && pendingRWCount > 0)) && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-medium">
                                        {Math.min(99, (pendingRTCount || 0) + (pendingRWCount || 0))}
                                    </span>
                                )}
                            </button>

                            <div className="flex items-center space-x-3">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user?.full_name || user?.email || 'User'}
                                    </p>
                                    <div className="text-xs text-gray-500">
                                        {isKetuaRW && (
                                            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium mr-2">
                                                Ketua RW {rwInfo?.rw_no || 'N/A'}
                                            </span>
                                        )}
                                        {isKetuaRT && (
                                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium mr-2">
                                                Ketua RT {rtInfo?.rt_no || 'N/A'}
                                            </span>
                                        )}
                                        {!isKetuaRT && !isKetuaRW && <span>{user?.email}</span>}
                                    </div>
                                </div>
                                
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                    isKetuaRW ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                                    isKetuaRT ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 
                                    'bg-gradient-to-br from-blue-500 to-purple-600'
                                }`}>
                                    {isKetuaRW ? (
                                        <Shield className="h-4 w-4 text-white" />
                                    ) : isKetuaRT ? (
                                        <Shield className="h-4 w-4 text-white" />
                                    ) : (
                                        <User className="h-4 w-4 text-white" />
                                    )}
                                </div>
                            </div>

                            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                                <Settings className="h-5 w-5" />
                            </button>

                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoggingOut ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                        <span className="text-sm font-medium">Keluar...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogOut className="h-4 w-4" />
                                        <span className="text-sm font-medium">Keluar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Selamat Datang, {user?.full_name || 'User'}! 👋
                    </h2>
                    <div className="flex items-center space-x-2">
                        <p className="text-gray-600">
                            Selamat datang di sistem manajemen RT-RW digital
                        </p>
                        {isKetuaRT && (
                            <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                <Shield className="h-4 w-4 mr-1" />
                                Ketua RT {rtInfo?.rt_no || 'N/A'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center">
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">1</p>
                                <p className="text-sm text-gray-500">Profil Aktif</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center">
                            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Home className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">0</p>
                                <p className="text-sm text-gray-500">Pengajuan Saya</p>
                            </div>
                        </div>
                    </div>

                    {/* RT Stats - tampil jika isKetuaRT true */}
                    {isKetuaRT && (
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 ring-2 ring-orange-200 bg-orange-50">
                            <div className="flex items-center">
                                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-orange-600">{pendingRTCount}</p>
                                    <p className="text-sm text-gray-500">Menunggu Persetujuan RT</p>
                                </div>
                            </div>
                            {pendingRTCount > 0 && (
                                <div className="mt-2">
                                    <div className="flex items-center text-xs text-orange-600">
                                        <Bell className="h-3 w-3 mr-1" />
                                        <span>Perlu ditinjau segera</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* RW Stats - tampil jika isKetuaRW true */}
                    {isKetuaRW && (
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 ring-2 ring-purple-200 bg-purple-50">
                            <div className="flex items-center">
                                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-purple-600">{pendingRWCount}</p>
                                    <p className="text-sm text-gray-500">Menunggu Persetujuan RW</p>
                                </div>
                            </div>
                            {pendingRWCount > 0 && (
                                <div className="mt-2">
                                    <div className="flex items-center text-xs text-purple-600">
                                        <Bell className="h-3 w-3 mr-1" />
                                        <span>Perlu persetujuan final</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center">
                            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Settings className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                            <p className="text-2xl font-bold text-gray-900">
                                {isKetuaRW ? 5 : isKetuaRT ? 4 : 3}
                            </p>
                            <p className="text-sm text-gray-500">Menu Aktif</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Menu Utama</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Profile Menu */}
                                {/* <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                            <User className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Profil Saya</h4>
                                            <p className="text-sm text-gray-500">Kelola data pribadi</p>
                                        </div>
                                    </div>
                                </button> */}

                                {/* // Profile Menu */}
                                {/* <NavigationCard
                                    to="/profile"
                                    icon={User}
                                    title="Profil Saya"
                                    description="Lihat dan edit informasi pribadi"
                                    color="indigo"
                                /> */}

                                {/* Surat Pengantar Menu */}
                                <NavigationCard
                                    to="/surat-pengantar"
                                    icon={MessageSquare}
                                    title="Surat Pengantar"
                                    description="Pengajuan surat pengantar dan correspondence"
                                    color="green"
                                />

                                {/* // Tambahkan di bagian grid menu utama, setelah Surat Pengantar Menu */}
                                <NavigationCard
                                    to="/kartu-keluarga"
                                    icon={User}
                                    title="Kartu Keluarga"
                                    description="Kelola data anggota keluarga"
                                    color="purple"
                                />

                                {/* RT Approval Menu - KONDISIONAL */}
                                {isKetuaRT && (
                                    <div className="relative">
                                        <div className="absolute -top-2 -right-2 z-10">
                                            <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                                NEW!
                                            </div>
                                        </div>
                                        <NavigationCard
                                            to="/rt/surat-pengantar"
                                            icon={Shield}
                                            title="Persetujuan RT"
                                            description="Kelola persetujuan surat pengantar warga RT"
                                            color="orange"
                                            badge={pendingRTCount > 0 ? pendingRTCount : null}
                                            badgeColor="orange"
                                            className="border-2 border-orange-200 bg-orange-50"
                                        />
                                    </div>
                                )}

                                {/* RW Approval Menu - KONDISIONAL */}
                                {isKetuaRW && (
                                    <div className="relative">
                                        <div className="absolute -top-2 -right-2 z-10">
                                            <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                                RW
                                            </div>
                                        </div>
                                        <NavigationCard
                                            to="/rw/surat-pengantar"
                                            icon={Shield}
                                            title="Persetujuan RW"
                                            description="Kelola persetujuan final surat pengantar"
                                            color="purple"
                                            badge={pendingRWCount > 0 ? pendingRWCount : null}
                                            badgeColor="purple"
                                            className="border-2 border-purple-200 bg-purple-50"
                                        />
                                    </div>
                                )}

                                {/* Debug Info Card - hanya untuk testing */}
                                {/* {isKetuaRT && (
                                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                                        <div className="text-xs text-green-800 space-y-1">
                                            <p><strong>✅ KETUA RT DETECTED!</strong></p>
                                            <p>• Role: {userRoles.find(r => r.role_name === 'KETUA RT')?.role_name}</p>
                                            <p>• RT: {rtInfo?.rt_no}</p>
                                            <p>• RW: {rtInfo?.rw_no}</p>
                                            <p>• Pending: {pendingRTCount}</p>
                                        </div>
                                    </div>
                                )} */}

                                {/* Standard menus */}
                                <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                                            <Bell className="h-5 w-5 text-yellow-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Pengumuman</h4>
                                            <p className="text-sm text-gray-500">Info terkini RT/RW</p>
                                        </div>
                                    </div>
                                </button>

                                <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                            <Settings className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Pengaturan</h4>
                                            <p className="text-sm text-gray-500">Konfigurasi akun</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Panel */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Profil</h3>
                            
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <div className="h-4 w-4 bg-green-500 rounded-full mr-3"></div>
                                    <span className="text-sm text-gray-600">Email Terverifikasi</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-4 w-4 bg-green-500 rounded-full mr-3"></div>
                                    <span className="text-sm text-gray-600">Data KTP Lengkap</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-4 w-4 bg-green-500 rounded-full mr-3"></div>
                                    <span className="text-sm text-gray-600">Profil Selesai</span>
                                </div>
                                {isKetuaRT && (
                                    <div className="flex items-center">
                                        <div className="h-4 w-4 bg-blue-500 rounded-full mr-3"></div>
                                        <span className="text-sm text-gray-600 font-medium">
                                            Role: Ketua RT {rtInfo?.rt_no || 'N/A'}
                                        </span>
                                    </div>
                                )}
                                {isKetuaRW && (
                                    <div className="flex items-center">
                                        <div className="h-4 w-4 bg-purple-500 rounded-full mr-3"></div>
                                        <span className="text-sm text-gray-600 font-medium">
                                            Role: Ketua RW {rwInfo?.rw_no || 'N/A'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900">Kelengkapan</span>
                                    <span className="text-sm font-medium text-green-600">100%</span>
                                </div>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full w-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* RT Management Panel - khusus Ketua RT */}
                        {isKetuaRT && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-blue-200">
                                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                    <Shield className="h-5 w-5 mr-2" />
                                    Panel Ketua RT
                                </h3>
                                
                                <div className="space-y-3">
                                    {pendingRTCount > 0 ? (
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 text-orange-600 mr-2" />
                                                    <span className="text-sm font-medium text-orange-800">
                                                        {pendingRTCount} pengajuan menunggu
                                                    </span>
                                                </div>
                                                <a 
                                                    href="/rt/surat-pengantar" 
                                                    className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full font-medium hover:bg-orange-300 transition-colors"
                                                >
                                                    Proses →
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                            <div className="flex items-center">
                                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                                <span className="text-sm text-green-800">
                                                    Semua pengajuan sudah diproses
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="text-xs text-blue-700 space-y-1">
                                        <p>• RT: {rtInfo?.rt_no || 'N/A'}</p>
                                        <p>• RW: {rtInfo?.rw_no || 'N/A'}</p>
                                        <p>• Lokasi: {rtInfo?.kelurahan_name || 'N/A'}</p>
                                        <p>• Update: {new Date().toLocaleTimeString('id-ID')}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* RW Management Panel - khusus Ketua RW */}
                        {isKetuaRW && (
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-purple-200">
                                <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                                    <Shield className="h-5 w-5 mr-2" />
                                    Panel Ketua RW
                                </h3>
                                
                                <div className="space-y-3">
                                    {pendingRWCount > 0 ? (
                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 text-purple-600 mr-2" />
                                                    <span className="text-sm font-medium text-purple-800">
                                                        {pendingRWCount} pengajuan menunggu persetujuan final
                                                    </span>
                                                </div>
                                                <a 
                                                    href="/rw/surat-pengantar" 
                                                    className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full font-medium hover:bg-purple-300 transition-colors"
                                                >
                                                    Proses →
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                            <div className="flex items-center">
                                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                                <span className="text-sm text-green-800">
                                                    Semua pengajuan sudah disetujui
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="text-xs text-purple-700 space-y-1">
                                        <p>• RW: {rwInfo?.rw_no || 'N/A'}</p>
                                        <p>• Kelurahan: {rwInfo?.kelurahan_name || 'N/A'}</p>
                                        <p>• Kecamatan: {rwInfo?.kecamatan_name || 'N/A'}</p>
                                        <p>• Update: {new Date().toLocaleTimeString('id-ID')}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h3>
                            
                            <div className="space-y-3">
                                <div className="text-sm text-gray-600">
                                    <p className="font-medium">Profil berhasil dilengkapi</p>
                                    <p className="text-xs text-gray-400">Baru saja</p>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p className="font-medium">Email berhasil diverifikasi</p>
                                    <p className="text-xs text-gray-400">Beberapa menit yang lalu</p>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p className="font-medium">Akun berhasil didaftarkan</p>
                                    <p className="text-xs text-gray-400">Hari ini</p>
                                </div>
                                {isKetuaRT && (
                                    <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded-lg">
                                        <p className="font-medium text-blue-800">Role Ketua RT diaktifkan</p>
                                        <p className="text-xs text-blue-600">RT {rtInfo?.rt_no} - Hari ini</p>
                                    </div>
                                )}
                                {isKetuaRW && (
                                    <div className="text-sm text-gray-600 bg-purple-50 p-2 rounded-lg">
                                        <p className="font-medium text-purple-800">Role Ketua RW diaktifkan</p>
                                        <p className="text-xs text-purple-600">RW {rwInfo?.rw_no} - Hari ini</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions untuk RT */}
                        {isKetuaRT && (
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat RT</h3>
                                
                                <div className="space-y-3">
                                    <a 
                                        href="/rt/surat-pengantar"
                                        className="w-full flex items-center justify-center py-2 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
                                    >
                                        <Shield className="h-4 w-4 mr-2" />
                                        Kelola Persetujuan RT
                                        {pendingRTCount > 0 && (
                                            <span className="ml-2 bg-orange-800 text-white px-2 py-1 rounded-full text-xs">
                                                {pendingRTCount}
                                            </span>
                                        )}
                                    </a>
                                    
                                    <button className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Laporan RT
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Quick Actions untuk RW */}
                        {isKetuaRW && (
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat RW</h3>
                                
                                <div className="space-y-3">
                                    <a 
                                        href="/rw/surat-pengantar"
                                        className="w-full flex items-center justify-center py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                                    >
                                        <Shield className="h-4 w-4 mr-2" />
                                        Kelola Persetujuan RW
                                        {pendingRWCount > 0 && (
                                            <span className="ml-2 bg-purple-800 text-white px-2 py-1 rounded-full text-xs">
                                                {pendingRWCount}
                                            </span>
                                        )}
                                    </a>
                                    
                                    <button className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Laporan RW
                                    </button>
                                    
                                    <button className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                        <Settings className="h-4 w-4 mr-2" />
                                        Manajemen RT
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;