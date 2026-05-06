export type Role = 'SUPER_ADMIN' | 'CLIENT_ADMIN' | 'ADMIN' | 'MANAGER' | 'USER';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    address?: string;
    profileImageUrl?: string;
    role: Role;
    tenantId?: string;
    tenantName?: string;
    isActive: boolean;
    linkedEmployeeId?: string;
    linkedEmployeeName?: string;
    customRoleId?: string;
    customRoleName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserRequest {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    address?: string;
    profileImageUrl?: string;
    role: Role;
    tenantId?: string;
    password?: string;
    isActive: boolean;
    customRoleId?: string;
}
