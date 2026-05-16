import axiosInstance, { extractErrorMessage } from '@/lib/api/axiosInstance';
import { Employee, EmployeeRequest } from '../types/employee.types';

const EMPLOYEE_BASE_URL = '/employees';

export const employeeApi = {
    getAll: async () => {
        try {
            const response = await axiosInstance.get<Employee[]>(EMPLOYEE_BASE_URL);
            return response.data;
        } catch (e) { throw new Error(extractErrorMessage(e)); }
    },
    getById: async (id: string) => {
        try {
            const response = await axiosInstance.get<Employee>(`${EMPLOYEE_BASE_URL}/${id}`);
            return response.data;
        } catch (e) { throw new Error(extractErrorMessage(e)); }
    },
    getMe: async (): Promise<Employee | null> => {
        try {
            const response = await axiosInstance.get<Employee>(`${EMPLOYEE_BASE_URL}/me`);
            return response.data;
        } catch { return null; }
    },
    create: async (data: EmployeeRequest) => {
        try {
            const response = await axiosInstance.post<Employee>(EMPLOYEE_BASE_URL, data);
            return response.data;
        } catch (e) { throw new Error(extractErrorMessage(e)); }
    },
    update: async (id: string, data: EmployeeRequest) => {
        try {
            const response = await axiosInstance.put<Employee>(`${EMPLOYEE_BASE_URL}/${id}`, data);
            return response.data;
        } catch (e) { throw new Error(extractErrorMessage(e)); }
    },
    delete: async (id: string) => {
        try {
            await axiosInstance.delete(`${EMPLOYEE_BASE_URL}/${id}`);
        } catch (e) { throw new Error(extractErrorMessage(e)); }
    }
};
