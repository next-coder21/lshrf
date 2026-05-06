import axiosInstance from '@/lib/api/axiosInstance';
import { Tenant, TenantRequest, ClientOnboardingRequest, ClientOnboardingResponse } from '../types/tenant.types';

const TENANT_BASE_URL = '/tenants';
const ONBOARDING_BASE_URL = '/onboarding';

export const tenantApi = {
    getAll: async (search?: string, page?: number, size?: number) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (page !== undefined) params.append('page', page.toString());
        if (size !== undefined) params.append('size', size.toString());

        const url = `${TENANT_BASE_URL}${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await axiosInstance.get<Tenant[]>(url);
        return response.data;
    },
    getById: async (id: string) => {
        const response = await axiosInstance.get<Tenant>(`${TENANT_BASE_URL}/${id}`);
        return response.data;
    },
    create: async (data: TenantRequest) => {
        const response = await axiosInstance.post<Tenant>(TENANT_BASE_URL, data);
        return response.data;
    },
    update: async (id: string, data: TenantRequest) => {
        const response = await axiosInstance.put<Tenant>(`${TENANT_BASE_URL}/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        await axiosInstance.delete(`${TENANT_BASE_URL}/${id}`);
    },
    toggleActivation: async (id: string) => {
        const response = await axiosInstance.patch<Tenant>(`${TENANT_BASE_URL}/${id}/toggle-activation`);
        return response.data;
    },

    // Full client onboarding (tenant + admin user)
    onboardClient: async (data: ClientOnboardingRequest) => {
        const response = await axiosInstance.post<ClientOnboardingResponse>(
            `${ONBOARDING_BASE_URL}/client`,
            data
        );
        return response.data;
    }
};

