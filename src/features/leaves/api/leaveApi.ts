import axiosInstance from '@/lib/api/axiosInstance';
import { Leave, LeaveRequest, LeaveStatus, LeaveTypeConfig, CreateLeaveTypeRequest } from '../types/leave.types';

const LEAVES_BASE_URL = '/leaves';

export const leaveApi = {
    getAll: async () => {
        const response = await axiosInstance.get<Leave[]>(LEAVES_BASE_URL);
        return response.data;
    },
    apply: async (data: LeaveRequest) => {
        const response = await axiosInstance.post<Leave>(LEAVES_BASE_URL, data);
        return response.data;
    },
    updateStatus: async (id: string, status: LeaveStatus, comments?: string) => {
        const response = await axiosInstance.patch<Leave>(`${LEAVES_BASE_URL}/${id}/status`, null, {
            params: { status, comments }
        });
        return response.data;
    },
    getByEmployee: async (employeeId: string) => {
        const response = await axiosInstance.get<Leave[]>(`${LEAVES_BASE_URL}/employee/${employeeId}`);
        return response.data;
    },
    cancel: async (id: string) => {
        await axiosInstance.delete(`${LEAVES_BASE_URL}/${id}`);
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
