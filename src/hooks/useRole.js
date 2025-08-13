// src/hooks/useRole.js - FIXED VERSION
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
        },
        onSuccess: (data) => {
            console.log('✅ My roles query success:', data);
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

    // FIXED: Extract roles array dengan error handling yang lebih baik
    const myRoles = (() => {
        try {
            if (!myRolesQuery.data) return [];
            
            // Handle different response structures
            if (myRolesQuery.data.success && myRolesQuery.data.data) {
                // Structure: { success: true, data: { roles: [...] } }
                return myRolesQuery.data.data.roles || myRolesQuery.data.data || [];
            } else if (myRolesQuery.data.roles) {
                // Structure: { roles: [...] }
                return myRolesQuery.data.roles;
            } else if (Array.isArray(myRolesQuery.data)) {
                // Direct array: [...]
                return myRolesQuery.data;
            }
            
            console.warn('⚠️ Unexpected roles response structure:', myRolesQuery.data);
            return [];
        } catch (error) {
            console.error('❌ Error parsing myRoles:', error);
            return [];
        }
    })();

    // FIXED: Helper functions dengan logging yang lebih detail
    const hasRole = (roleName) => {
        console.log(`🔍 Checking hasRole("${roleName}")`);
        console.log('📊 Available roles:', myRoles?.map(r => r.role_name));
        
        if (!Array.isArray(myRoles)) {
            console.warn('⚠️ myRoles is not an array:', myRoles);
            return false;
        }
        
        const hasRoleResult = myRoles.some(role => {
            const roleNameMatch = role.role_name === roleName;
            console.log(`  - Checking role "${role.role_name}" vs "${roleName}": ${roleNameMatch}`);
            return roleNameMatch;
        });
        
        console.log(`✅ hasRole("${roleName}") result:`, hasRoleResult);
        return hasRoleResult;
    };

    const hasAnyRole = (roleNames) => {
        console.log(`🔍 Checking hasAnyRole(${JSON.stringify(roleNames)})`);
        
        if (!Array.isArray(myRoles)) {
            console.warn('⚠️ myRoles is not an array:', myRoles);
            return false;
        }
        
        const result = roleNames.some(roleName => 
            myRoles.some(role => {
                const match = role.role_name === roleName;
                console.log(`  - Checking "${role.role_name}" === "${roleName}": ${match}`);
                return match;
            })
        );
        
        console.log(`✅ hasAnyRole result:`, result);
        return result;
    };

    const getRoleInLocation = (roleName, locationType = null) => {
        console.log(`🔍 Getting role "${roleName}" in location type "${locationType}"`);
        
        if (!Array.isArray(myRoles)) {
            console.warn('⚠️ myRoles is not an array:', myRoles);
            return null;
        }
        
        const foundRole = myRoles.find(role => {
            if (role.role_name !== roleName) return false;
            
            // If no location type specified, return any match
            if (!locationType) return true;
            
            // Check for specific location type
            if (locationType === 'RT' && role.rt_id) return true;
            if (locationType === 'RW' && role.rw_id) return true;
            
            return false;
        });
        
        console.log(`✅ getRoleInLocation result:`, foundRole);
        return foundRole || null;
    };

    // FIXED: Simple boolean functions dengan explicit logging
    const isRT = () => {
        const result = hasRole('KETUA RT');
        console.log(`🏠 isRT() result: ${result}`);
        return result;
    };

    const isRW = () => {
        const result = hasRole('KETUA RW');
        console.log(`🏛️ isRW() result: ${result}`);
        return result;
    };

    const isAdmin = () => {
        const result = hasAnyRole(['ADMIN', 'SUPER ADMIN']);
        console.log(`👑 isAdmin() result: ${result}`);
        return result;
    };

    const isSuperAdmin = () => {
        const result = hasRole('SUPER ADMIN');
        console.log(`🦸 isSuperAdmin() result: ${result}`);
        return result;
    };

    const fetchLocationRoles = (type, locationId) => {
        locationRolesQuery.refetch({
            queryFn: () => roleService.getLocationRoles(type, locationId)
        });
    };

    // FIXED: getUserLocation dengan error handling yang lebih baik
    const getUserLocation = () => {
        console.log('📍 Getting user location...');
        
        if (!Array.isArray(myRoles) || myRoles.length === 0) {
            console.log('📍 No roles found for location');
            return null;
        }
        
        // Try to find RT location first
        const rtRole = myRoles.find(role => role.rt_id);
        if (rtRole) {
            const location = {
                type: 'RT',
                id: rtRole.rt_id,
                name: rtRole.rt_no,
                rw_id: rtRole.rw_id,
                rw_name: rtRole.rw_no
            };
            console.log('📍 Found RT location:', location);
            return location;
        }
        
        // Try to find RW location
        const rwRole = myRoles.find(role => role.rw_id);
        if (rwRole) {
            const location = {
                type: 'RW',
                id: rwRole.rw_id,
                name: rwRole.rw_no
            };
            console.log('📍 Found RW location:', location);
            return location;
        }
        
        console.log('📍 No location found');
        return null;
    };

    // Get role permissions
    const getPermissions = () => {
        if (!Array.isArray(myRoles)) return [];
        
        const permissions = new Set();
        
        myRoles.forEach(role => {
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
    };

    console.log('🎯 useRole hook returning:', {
        myRoles,
        myRolesLoading: myRolesQuery.isLoading,
        isRT: isRT(),
        isRW: isRW(),
        isAdmin: isAdmin(),
        location: getUserLocation()
    });

    return {
        // Data
        myRoles,
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
        getUserLocation,
        
        // Get role permissions
        getPermissions
    };
};