import axiosInstance from '@/lib/api/axiosInstance';
import { Department, DepartmentRequest } from '../types/department.types';

const BASE = '/departments';

export const departmentApi = {
    getAll: async (tenantId?: string): Promise<Department[]> => {
        const params = tenantId ? `?tenantId=${tenantId}` : '';
        const res = await axiosInstance.get<Department[]>(`${BASE}${params}`);
        return res.data;
    },
    create: async (data: DepartmentRequest): Promise<Department> => {
        const res = await axiosInstance.post<Department>(BASE, data);
        return res.data;
    },
    update: async (id: string, data: DepartmentRequest): Promise<Department> => {
        const res = await axiosInstance.put<Department>(`${BASE}/${id}`, data);
        return res.data;
    },
    delete: async (id: string): Promise<void> => {
        await axiosInstance.delete(`${BASE}/${id}`);
    },
};
