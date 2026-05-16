import axiosInstance, { extractErrorMessage } from '@/lib/api/axiosInstance';
import { Leave, LeaveBalance, LeaveRequest, LeaveStatus, LeaveTypeConfig, CreateLeaveTypeRequest } from '../types/leave.types';

const LEAVES_BASE_URL = '/leaves';

export const leaveApi = {
    getAll: async () => {
        try {
            const response = await axiosInstance.get<Leave[]>(LEAVES_BASE_URL);
            return response.data;
        } catch (e) { throw new Error(extractErrorMessage(e)); }
    },
    apply: async (data: LeaveRequest) => {
        try {
            const response = await axiosInstance.post<Leave>(LEAVES_BASE_URL, data);
            return response.data;
        } catch (e) { throw new Error(extractErrorMessage(e)); }
    },
    updateStatus: async (id: string, status: LeaveStatus, comments?: string) => {
        try {
            const response = await axiosInstance.patch<Leave>(`${LEAVES_BASE_URL}/${id}/status`, null, {
                params: { status, comments }
            });
            return response.data;
        } catch (e) { throw new Error(extractErrorMessage(e)); }
    },
    getByEmployee: async (employeeId: string) => {
        try {
            const response = await axiosInstance.get<Leave[]>(`${LEAVES_BASE_URL}/employee/${employeeId}`);
            return response.data;
        } catch (e) { throw new Error(extractErrorMessage(e)); }
    },
    cancel: async (id: string) => {
        try {
            await axiosInstance.delete(`${LEAVES_BASE_URL}/${id}`);
        } catch (e) { throw new Error(extractErrorMessage(e)); }
    },
    getBalance: async (): Promise<LeaveBalance[]> => {
        try {
            const response = await axiosInstance.get<LeaveBalance[]>(`${LEAVES_BASE_URL}/balance`);
            return response.data;
        } catch { return []; }
    },

    // Leave Type Config
    getLeaveTypes: async () => {
        const response = await axiosInstance.get<LeaveTypeConfig[]>('/leave-types');
        return response.data;
    },
    getActiveLeaveTypes: async () => {
        const response = await axiosInstance.get<LeaveTypeConfig[]>('/leave-types/active');
        return response.data;
    },
    createLeaveType: async (data: CreateLeaveTypeRequest) => {
        const response = await axiosInstance.post<LeaveTypeConfig>('/leave-types', data);
        return response.data;
    },
    updateLeaveType: async (id: string, data: Partial<CreateLeaveTypeRequest>) => {
        const response = await axiosInstance.put<LeaveTypeConfig>(`/leave-types/${id}`, data);
        return response.data;
    },
    deleteLeaveType: async (id: string) => {
        await axiosInstance.delete(`/leave-types/${id}`);
    }
};
