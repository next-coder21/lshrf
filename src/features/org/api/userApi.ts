import axiosInstance from '@/lib/api/axiosInstance';
import { User, UserRequest } from '../types/user.types';

const USER_BASE_URL = '/users';

export const userApi = {
    getAll: async (search?: string, tenantId?: string, page?: number, size?: number) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (tenantId) params.append('tenantId', tenantId);
        if (page !== undefined) params.append('page', page.toString());
        if (size !== undefined) params.append('size', size.toString());

        const url = `${USER_BASE_URL}${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await axiosInstance.get<User[]>(url);
        return response.data;
    },
    toggleActivation: async (id: string) => {
        const response = await axiosInstance.patch<User>(`${USER_BASE_URL}/${id}/toggle-activation`);
        return response.data;
    },
    getById: async (id: string) => {
        const response = await axiosInstance.get<User>(`${USER_BASE_URL}/${id}`);
        return response.data;
    },
    create: async (data: UserRequest) => {
        const response = await axiosInstance.post<User>(USER_BASE_URL, data);
        return response.data;
    },
    update: async (id: string, data: UserRequest) => {
        const response = await axiosInstance.put<User>(`${USER_BASE_URL}/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        await axiosInstance.delete(`${USER_BASE_URL}/${id}`);
    },
    exportUsers: async (tenantId?: string): Promise<Blob> => {
        const params = tenantId ? `?tenantId=${tenantId}` : '';
        const response = await axiosInstance.get(`${USER_BASE_URL}/export${params}`, {
            responseType: 'blob'
        });
        return response.data;
    }
};
