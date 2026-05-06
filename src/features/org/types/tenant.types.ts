export interface Tenant {
    id: string;
    name: string;
    slug: string;
    prefix: string;
    contactEmail: string;
    phoneNumber?: string;
    website?: string;
    address?: string;
    industry?: string;
    timezone?: string;
    logoUrl?: string;
    brandColor?: string;
    currency?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TenantRequest {
    name: string;
    slug: string;
    prefix: string;
    contactEmail: string;
    phoneNumber?: string;
    website?: string;
    address?: string;
    industry?: string;
    timezone?: string;
    logoUrl?: string;
    brandColor?: string;
    currency?: string;
    active: boolean;
}

export interface AdminUserDetails {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    designation: string;
    department: string;
}

export interface ClientOnboardingRequest {
    // Tenant details
    name: string;
    slug: string;
    prefix: string;
    contactEmail: string;
    phoneNumber?: string;
    website?: string;
    address: string;
    industry?: string;
    timezone: string;
    brandColor?: string;
    currency: string;
    logoUrl?: string;

    // Admin user details
    adminUser: AdminUserDetails;
}

export interface ClientOnboardingResponse {
    tenantId: string;
    tenantName: string;
    slug: string;
    adminUserId: string;
    adminEmail: string;
    message: string;
    createdAt: string;
}

