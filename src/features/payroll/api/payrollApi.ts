import axiosInstance from '@/lib/api/axiosInstance';
import { Payroll, PayrollRequest, PayrollStatus } from '../types/payroll.types';

const PAYROLL_BASE_URL = '/payroll';

export const payrollApi = {
    getAll: async () => {
        const response = await axiosInstance.get<Payroll[]>(PAYROLL_BASE_URL);
        return response.data;
    },
    process: async (data: PayrollRequest) => {
        const response = await axiosInstance.post<Payroll>(PAYROLL_BASE_URL, data);
        return response.data;
    },
    updateStatus: async (id: string, status: PayrollStatus) => {
        const response = await axiosInstance.patch<Payroll>(`${PAYROLL_BASE_URL}/${id}/status`, null, {
            params: { status }
        });
        return response.data;
    },
    getByEmployee: async (employeeId: string) => {
        const response = await axiosInstance.get<Payroll[]>(`${PAYROLL_BASE_URL}/employee/${employeeId}`);
        return response.data;
    },
    getByPeriod: async (month: number, year: number) => {
        const response = await axiosInstance.get<Payroll[]>(`${PAYROLL_BASE_URL}/period`, {
            params: { month, year }
        });
        return response.data;
    }
};
