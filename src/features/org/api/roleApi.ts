import axiosInstance from '../../../lib/api/axiosInstance';

export interface Role {
    id?: string;
    name: string;
    displayName: string;
    description: string;
    permissions: string[];
    userCount: number;
    isSystem: boolean;
    isCustom: boolean;
    tenantId?: string;
    tenantName?: string;
    createdAt?: string;
}

export interface Permission {
    name: string;
    displayName: string;
    category: string;
}

export interface RoleRequest {
    name: string;
    description?: string;
    permissions: string[];
    tenantId?: string;
}

/**
 * Get all roles (system + custom) for a tenant.
 */
export const getRoles = async (tenantId?: string): Promise<Role[]> => {
    const res = await axiosInstance.get('/roles', { params: { tenantId } });
    return res.data;
};

/**
 * Get all available system permissions grouped by category.
 */
export const getPermissions = async (): Promise<Permission[]> => {
    const res = await axiosInstance.get('/roles/permissions');
    return res.data;
};

/**
 * Get single role by ID.
 */
export const getRoleById = async (id: string): Promise<Role> => {
    const res = await axiosInstance.get(`/roles/${id}`);
    return res.data;
};

/**
 * Create a new custom role.
 */
export const createRole = async (data: RoleRequest): Promise<Role> => {
    const res = await axiosInstance.post('/roles', data);
    return res.data;
};

/**
 * Update an existing custom role.
 */
export const updateRole = async (id: string, data: RoleRequest): Promise<Role> => {
    const res = await axiosInstance.put(`/roles/${id}`, data);
    return res.data;
};

/**
 * Delete a custom role.
 */
export const deleteRole = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/roles/${id}`);
};
