// src/pages/Dashboard.jsx - Enhanced dengan logout functionality
import { LogOut, User, Settings, Bell, Home } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
    const { logout, isLoggingOut } = useAuth();
    const { user } = useAuthStore();

    const handleLogout = () => {
        if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
        logout();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                {/* Logo & Title */}
                <div className="flex items-center">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                    <Home className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">SMART-RW</h1>
                    <p className="text-xs text-gray-500">Sistem Manajemen RT-RW</p>
                </div>
                </div>

                {/* User Menu */}
                <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                    <Bell className="h-5 w-5" />
                </button>

                {/* User Info */}
                <div className="flex items-center space-x-3">
                    <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                        {user?.full_name || user?.email || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                        {user?.email}
                    </p>
                    </div>
                    
                    {/* Avatar */}
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                    </div>
                </div>

                {/* Settings */}
                <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                    <Settings className="h-5 w-5" />
                </button>

                {/* Logout Button */}
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
            {/* Welcome Section */}
            <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Selamat Datang, {user?.full_name || 'User'}! 👋
            </h2>
            <p className="text-gray-600">
                Selamat datang di sistem manajemen RT-RW digital
            </p>
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
                    <p className="text-sm text-gray-500">Pengajuan</p>
                </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Bell className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-500">Notifikasi</p>
                </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">3</p>
                    <p className="text-sm text-gray-500">Menu Aktif</p>
                </div>
                </div>
            </div>
            </div>

            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Quick Actions */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Menu Utama</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                        <h4 className="font-medium text-gray-900">Profil Saya</h4>
                        <p className="text-sm text-gray-500">Kelola data pribadi</p>
                        </div>
                    </div>
                    </button>

                    <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center">
                        <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <Home className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                        <h4 className="font-medium text-gray-900">Surat Menyurat</h4>
                        <p className="text-sm text-gray-500">Pengajuan surat</p>
                        </div>
                    </div>
                    </button>

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

            {/* Right Column - Info Panel */}
            <div className="space-y-6">
                {/* Completion Status */}
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
                </div>
                </div>
            </div>
            </div>
        </main>
        </div>
    );
};

export default Dashboard;