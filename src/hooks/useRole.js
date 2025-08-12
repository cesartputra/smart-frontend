// src/hooks/useRole.js
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const roleService = {
    // Get my roles
    getMyRoles: async () => {
        console.log('RoleService.getMyRoles called');
        try {
            const response = await api.get('/api/user-roles/my-roles');
            console.log('GetMyRoles response:', response.data);
            return response.data;
        } catch (error) {
            console.error('RoleService.getMyRoles error:', error);
            throw error;
        }
    },

    // Check specific role
    hasRole: async (roleName) => {
        console.log('RoleService.hasRole called with:', roleName);
        try {
            const response = await api.get(`/api/user-roles/has-role/${roleName}`);
            console.log('HasRole response:', response.data);
            return response.data;
        } catch (error) {
            console.error('RoleService.hasRole error:', error);
            throw error;
        }
    },

    // Get location roles
    getLocationRoles: async (type, locationId) => {
        console.log('RoleService.getLocationRoles called with:', { type, locationId });
        try {
            const response = await api.get(`/api/user-roles/location/${type}/${locationId}`);
            console.log('GetLocationRoles response:', response.data);
            return response.data;
        } catch (error) {
            console.error('RoleService.getLocationRoles error:', error);
            throw error;
        }
    },

    // Assign role (admin only)
    assignRole: async (data) => {
        console.log('RoleService.assignRole called with:', data);
        try {
            const response = await api.post('/api/user-roles/assign', data);
            console.log('AssignRole response:', response.data);
            return response.data;
        } catch (error) {
            console.error('RoleService.assignRole error:', error);
            throw error;
        }
    },

    // Remove role (admin only)
    removeRole: async (data) => {
        console.log('RoleService.removeRole called with:', data);
        try {
            const response = await api.post('/api/user-roles/remove', data);
            console.log('RemoveRole response:', response.data);
            return response.data;
        } catch (error) {
            console.error('RoleService.removeRole error:', error);
            throw error;
        }
    }
};

export const useRole = () => {
    // Get user's roles
    const myRolesQuery = useQuery({
        queryKey: ['my-roles'],
        queryFn: roleService.getMyRoles,
        retry: 2,
        staleTime: 5 * 60 * 1000, // 5 minutes
        onError: (error) => {
            console.error('❌ My roles query error:', error);
        }
    });

    // Location roles query (enabled only when called)
    const locationRolesQuery = useQuery({
        queryKey: ['location-roles'],
        queryFn: () => null,
        enabled: false,
        retry: 2,
        onError: (error) => {
            console.error('❌ Location roles query error:', error);
        }
    });

    // Assign role mutation
    const assignRoleMutation = useMutation({
        mutationFn: roleService.assignRole,
        onSuccess: (data) => {
            console.log('✅ Role assigned successfully:', data);
            toast.success('Role berhasil diberikan!');
            // Invalidate relevant queries
            myRolesQuery.refetch();
        },
        onError: (error) => {
            console.error('❌ Assign role error:', error);
            const message = error.response?.data?.message || 'Gagal memberikan role';
            toast.error(message);
        },
    });

    // Remove role mutation
    const removeRoleMutation = useMutation({
        mutationFn: roleService.removeRole,
        onSuccess: (data) => {
            console.log('✅ Role removed successfully:', data);
            toast.success('Role berhasil dihapus!');
            // Invalidate relevant queries
            myRolesQuery.refetch();
        },
        onError: (error) => {
            console.error('❌ Remove role error:', error);
            const message = error.response?.data?.message || 'Gagal menghapus role';
            toast.error(message);
        },
    });

    // Helper functions
    const hasRole = (roleName) => {
        const roles = myRolesQuery.data?.roles || [];
        return roles.some(role => role.role_name === roleName);
    };

    const hasAnyRole = (roleNames) => {
        const roles = myRolesQuery.data?.roles || [];
        return roleNames.some(roleName => 
            roles.some(role => role.role_name === roleName)
        );
    };

    const getRoleInLocation = (roleName, locationType = null) => {
        const roles = myRolesQuery.data?.roles || [];
        return roles.find(role => {
            if (role.role_name !== roleName) return false;
            
            // If no location type specified, return any match
            if (!locationType) return true;
            
            // Check for specific location type
            if (locationType === 'RT' && role.rt_id) return true;
            if (locationType === 'RW' && role.rw_id) return true;
            
            return false;
        });
    };

    const isRT = () => hasRole('KETUA RT');
    const isRW = () => hasRole('KETUA RW');
    const isAdmin = () => hasAnyRole(['ADMIN', 'SUPER ADMIN']);
    const isSuperAdmin = () => hasRole('SUPER ADMIN');

    const fetchLocationRoles = (type, locationId) => {
        locationRolesQuery.refetch({
            queryFn: () => roleService.getLocationRoles(type, locationId)
        });
    };

    return {
        // Data
        myRoles: myRolesQuery.data?.roles || [],
        locationRoles: locationRolesQuery.data?.roles || [],
        
        // Loading states
        myRolesLoading: myRolesQuery.isFetching,
        locationRolesLoading: locationRolesQuery.isFetching,
        isAssigning: assignRoleMutation.isPending,
        isRemoving: removeRoleMutation.isPending,
        
        // Actions
        assignRole: assignRoleMutation.mutate,
        removeRole: removeRoleMutation.mutate,
        fetchMyRoles: myRolesQuery.refetch,
        fetchLocationRoles,
        
        // Helper functions
        hasRole,
        hasAnyRole,
        getRoleInLocation,
        isRT,
        isRW,
        isAdmin,
        isSuperAdmin,
        
        // Specific role checks with location
        canManageRT: () => {
            const rtRole = getRoleInLocation('KETUA RT', 'RT');
            return rtRole || isAdmin();
        },
        
        canManageRW: () => {
            const rwRole = getRoleInLocation('KETUA RW', 'RW');
            return rwRole || isAdmin();
        },
        
        canManageUsers: () => isAdmin(),
        
        // Get user's location info
        getUserLocation: () => {
            const roles = myRolesQuery.data?.roles || [];
            
            // Try to find RT location first
            const rtRole = roles.find(role => role.rt_id);
            if (rtRole) {
                return {
                    type: 'RT',
                    id: rtRole.rt_id,
                    name: rtRole.rt_no,
                    rw_id: rtRole.rw_id,
                    rw_name: rtRole.rw_no
                };
            }
            
            // Try to find RW location
            const rwRole = roles.find(role => role.rw_id);
            if (rwRole) {
                return {
                    type: 'RW',
                    id: rwRole.rw_id,
                    name: rwRole.rw_no
                };
            }
            
            return null;
        },
        
        // Get role permissions
        getPermissions: () => {
            const roles = myRolesQuery.data?.roles || [];
            const permissions = new Set();
            
            roles.forEach(role => {
                switch (role.role_name) {
                    case 'SUPER ADMIN':
                        permissions.add('manage_all');
                        permissions.add('manage_users');
                        permissions.add('manage_roles');
                        permissions.add('view_reports');
                        permissions.add('manage_surat_pengantar');
                        break;
                    case 'ADMIN':
                        permissions.add('manage_users');
                        permissions.add('view_reports');
                        permissions.add('manage_surat_pengantar');
                        break;
                    case 'KETUA RW':
                        permissions.add('approve_rw');
                        permissions.add('view_rw_reports');
                        permissions.add('manage_rt');
                        break;
                    case 'KETUA RT':
                        permissions.add('approve_rt');
                        permissions.add('view_rt_reports');
                        break;
                    case 'WARGA':
                        permissions.add('create_surat_pengantar');
                        permissions.add('view_own_data');
                        break;
                    default:
                        break;
                }
            });
            
            return Array.from(permissions);
        }
    };
};