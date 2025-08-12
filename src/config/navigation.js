// src/config/navigation.js - Navigation configuration based on user roles
import { 
    FileText, 
    Users, 
    Settings, 
    BarChart3, 
    Shield, 
    Home,
    UserCheck,
    MessageSquare,
    ClipboardList,
    Bell,
    Download
} from 'lucide-react';

/**
 * Navigation configuration based on user roles
 * Each menu item includes role-based visibility and permissions
 */

// Base navigation items available to all authenticated users
export const baseNavigation = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        description: 'Halaman utama sistem',
        roles: ['*'], // Available to all roles
        requiresCompletion: true
    },
    {
        name: 'Surat Pengantar',
        href: '/surat-pengantar',
        icon: FileText,
        description: 'Kelola pengajuan surat pengantar',
        roles: ['*'],
        requiresCompletion: true,
        badge: null, // Can be dynamically set
        subItems: [
            {
                name: 'Daftar Pengajuan',
                href: '/surat-pengantar',
                description: 'Lihat semua pengajuan surat'
            },
            {
                name: 'Buat Pengajuan',
                href: '/surat-pengantar/create',
                description: 'Ajukan surat pengantar baru'
            }
        ]
    },
    {
        name: 'Profil',
        href: '/profile',
        icon: UserCheck,
        description: 'Kelola data profil Anda',
        roles: ['*'],
        requiresCompletion: true
    }
];

// RT-specific navigation items
export const rtNavigation = [
    {
        name: 'Dashboard RT',
        href: '/rt/surat-pengantar',
        icon: ClipboardList,
        description: 'Kelola persetujuan surat pengantar RT',
        roles: ['KETUA RT'],
        requiresCompletion: true,
        badge: 'rt-pending' // Dynamic badge for pending count
    },
    {
        name: 'Laporan RT',
        href: '/rt/reports',
        icon: BarChart3,
        description: 'Laporan dan statistik RT',
        roles: ['KETUA RT'],
        requiresCompletion: true
    }
];

// RW-specific navigation items
export const rwNavigation = [
    {
        name: 'Dashboard RW',
        href: '/rw/surat-pengantar',
        icon: Shield,
        description: 'Kelola persetujuan surat pengantar RW',
        roles: ['KETUA RW'],
        requiresCompletion: true,
        badge: 'rw-pending'
    },
    {
        name: 'Kelola RT',
        href: '/rw/manage-rt',
        icon: Users,
        description: 'Kelola RT dalam RW',
        roles: ['KETUA RW'],
        requiresCompletion: true
    },
    {
        name: 'Laporan RW',
        href: '/rw/reports',
        icon: BarChart3,
        description: 'Laporan dan statistik RW',
        roles: ['KETUA RW'],
        requiresCompletion: true
    }
];

// Admin-specific navigation items
export const adminNavigation = [
    {
        name: 'Admin Dashboard',
        href: '/admin/surat-pengantar',
        icon: Settings,
        description: 'Dashboard administrasi sistem',
        roles: ['ADMIN', 'SUPER ADMIN'],
        requiresCompletion: true
    },
    {
        name: 'Kelola Pengguna',
        href: '/admin/users',
        icon: Users,
        description: 'Manajemen pengguna sistem',
        roles: ['ADMIN', 'SUPER ADMIN'],
        requiresCompletion: true,
        subItems: [
            {
                name: 'Daftar Pengguna',
                href: '/admin/users',
                description: 'Lihat semua pengguna'
            },
            {
                name: 'Kelola Role',
                href: '/admin/roles',
                description: 'Atur role dan permission'
            }
        ]
    },
    {
        name: 'Laporan Sistem',
        href: '/admin/reports',
        icon: BarChart3,
        description: 'Laporan dan analisis sistem',
        roles: ['ADMIN', 'SUPER ADMIN'],
        requiresCompletion: true,
        subItems: [
            {
                name: 'Statistik Surat',
                href: '/admin/surat-pengantar/statistics',
                description: 'Analisis pengajuan surat'
            },
            {
                name: 'Aktivitas Pengguna',
                href: '/admin/reports/users',
                description: 'Log aktivitas pengguna'
            }
        ]
    },
    {
        name: 'Pengaturan Sistem',
        href: '/admin/settings',
        icon: Settings,
        description: 'Konfigurasi sistem',
        roles: ['SUPER ADMIN'],
        requiresCompletion: true
    }
];

// Quick actions that appear in dashboard or as floating buttons
export const quickActions = [
    {
        name: 'Buat Surat Pengantar',
        href: '/surat-pengantar/create',
        icon: FileText,
        color: 'bg-blue-600 hover:bg-blue-700',
        roles: ['*'],
        description: 'Buat pengajuan surat pengantar baru'
    },
    {
        name: 'Scan QR Code',
        href: '/verify',
        icon: Download,
        color: 'bg-green-600 hover:bg-green-700',
        roles: ['*'],
        description: 'Verifikasi QR code surat pengantar',
        external: true // Opens camera or file picker
    }
];

// Notification types for the notification center
export const notificationTypes = [
    {
        type: 'surat_approved',
        icon: FileText,
        color: 'text-green-600',
        title: 'Surat Disetujui',
        roles: ['*']
    },
    {
        type: 'surat_rejected',
        icon: FileText,
        color: 'text-red-600',
        title: 'Surat Ditolak',
        roles: ['*']
    },
    {
        type: 'pending_approval',
        icon: ClipboardList,
        color: 'text-orange-600',
        title: 'Menunggu Persetujuan',
        roles: ['KETUA RT', 'KETUA RW']
    },
    {
        type: 'system_update',
        icon: Bell,
        color: 'text-blue-600',
        title: 'Update Sistem',
        roles: ['*']
    }
];

/**
 * Helper function to filter navigation based on user roles
 * @param {Array} navigationItems - Navigation items to filter
 * @param {Array} userRoles - User's current roles
 * @param {Object} completionStatus - User's profile completion status
 * @returns {Array} Filtered navigation items
 */
export const filterNavigationByRole = (navigationItems, userRoles = [], completionStatus = {}) => {
    const userRoleNames = userRoles.map(role => role.role_name || role);
    
    return navigationItems.filter(item => {
        // Check if user has required roles
        const hasRole = item.roles.includes('*') || 
            item.roles.some(role => userRoleNames.includes(role));
        
        if (!hasRole) return false;
        
        // Check completion requirements
        if (item.requiresCompletion) {
            return completionStatus.isEmailVerified && 
                   completionStatus.hasCompletedKTP && 
                   completionStatus.hasCompletedUserDetails;
        }
        
        return true;
    });
};

/**
 * Get navigation for specific user
 * @param {Object} user - User object with roles
 * @param {Object} completionStatus - Profile completion status
 * @returns {Object} Complete navigation structure
 */
export const getNavigationForUser = (user, completionStatus) => {
    const userRoles = user?.roles || [];
    
    const navigation = {
        primary: filterNavigationByRole(baseNavigation, userRoles, completionStatus),
        rt: filterNavigationByRole(rtNavigation, userRoles, completionStatus),
        rw: filterNavigationByRole(rwNavigation, userRoles, completionStatus),
        admin: filterNavigationByRole(adminNavigation, userRoles, completionStatus),
        quickActions: filterNavigationByRole(quickActions, userRoles, completionStatus)
    };
    
    return navigation;
};

/**
 * Get badge count for navigation items (for pending approvals, etc.)
 * @param {string} badgeType - Type of badge to get count for
 * @param {Object} userStats - User statistics object
 * @returns {number|null} Badge count or null if no badge needed
 */
export const getBadgeCount = (badgeType, userStats = {}) => {
    switch (badgeType) {
        case 'rt-pending':
            return userStats.pendingRTApprovals || null;
        case 'rw-pending':
            return userStats.pendingRWApprovals || null;
        case 'notifications':
            return userStats.unreadNotifications || null;
        default:
            return null;
    }
};

/**
 * Get breadcrumb for current path
 * @param {string} pathname - Current pathname
 * @param {Object} navigation - Navigation structure
 * @returns {Array} Breadcrumb items
 */
export const getBreadcrumb = (pathname, navigation) => {
    const breadcrumb = [
        { name: 'Dashboard', href: '/dashboard' }
    ];
    
    // Simple breadcrumb logic - can be enhanced
    if (pathname.startsWith('/surat-pengantar')) {
        breadcrumb.push({ name: 'Surat Pengantar', href: '/surat-pengantar' });
        
        if (pathname.includes('/create')) {
            breadcrumb.push({ name: 'Buat Pengajuan', href: pathname });
        } else if (pathname.match(/\/[a-f0-9-]{36}$/)) {
            breadcrumb.push({ name: 'Detail Surat', href: pathname });
        }
    } else if (pathname.startsWith('/rt/')) {
        breadcrumb.push({ name: 'Dashboard RT', href: '/rt/surat-pengantar' });
    } else if (pathname.startsWith('/rw/')) {
        breadcrumb.push({ name: 'Dashboard RW', href: '/rw/surat-pengantar' });
    } else if (pathname.startsWith('/admin/')) {
        breadcrumb.push({ name: 'Admin', href: '/admin/surat-pengantar' });
    }
    
    return breadcrumb;
};

export default {
    baseNavigation,
    rtNavigation,
    rwNavigation,
    adminNavigation,
    quickActions,
    notificationTypes,
    filterNavigationByRole,
    getNavigationForUser,
    getBadgeCount,
    getBreadcrumb
};