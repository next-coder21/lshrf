import axiosInstance from '@/lib/api/axiosInstance';
import { Employee, EmployeeRequest } from '../types/employee.types';

const EMPLOYEE_BASE_URL = '/employees';

export const employeeApi = {
    getAll: async () => {
        const response = await axiosInstance.get<Employee[]>(EMPLOYEE_BASE_URL);
        return response.data;
    },
    getById: async (id: string) => {
        const response = await axiosInstance.get<Employee>(`${EMPLOYEE_BASE_URL}/${id}`);
        return response.data;
    },
    create: async (data: EmployeeRequest) => {
        const response = await axiosInstance.post<Employee>(EMPLOYEE_BASE_URL, data);
        return response.data;
    },
    update: async (id: string, data: EmployeeRequest) => {
        const response = await axiosInstance.put<Employee>(`${EMPLOYEE_BASE_URL}/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        await axiosInstance.delete(`${EMPLOYEE_BASE_URL}/${id}`);
    }
};
