import axiosInstance from '@/lib/api/axiosInstance';
import { Attendance, AttendanceRequest, RegularizationRequest, RegularizationResponse, RegularizationStatus } from '../types/attendance.types';

const ATTENDANCE_BASE_URL = '/attendance';

export const attendanceApi = {
    getAll: async () => {
        const response = await axiosInstance.get<Attendance[]>(ATTENDANCE_BASE_URL);
        return response.data;
    },
    checkIn: async (data: AttendanceRequest) => {
        const response = await axiosInstance.post<Attendance>(`${ATTENDANCE_BASE_URL}/check-in`, data);
        return response.data;
    },
    checkOut: async (data: AttendanceRequest) => {
        const response = await axiosInstance.post<Attendance>(`${ATTENDANCE_BASE_URL}/check-out`, data);
        return response.data;
    },
    getByEmployee: async (employeeId: string) => {
        const response = await axiosInstance.get<Attendance[]>(`${ATTENDANCE_BASE_URL}/employee/${employeeId}`);
        return response.data;
    },
    getByDate: async (date: string) => {
        const response = await axiosInstance.get<Attendance[]>(`${ATTENDANCE_BASE_URL}/date/${date}`);
        return response.data;
    },
    submitRegularization: async (data: RegularizationRequest) => {
        const response = await axiosInstance.post<RegularizationResponse>(`${ATTENDANCE_BASE_URL}/regularizations`, data);
        return response.data;
    },
    getPendingRegularizations: async () => {
        const response = await axiosInstance.get<RegularizationResponse[]>(`${ATTENDANCE_BASE_URL}/regularizations/pending`);
        return response.data;
    },
    reviewRegularization: async (id: string, status: RegularizationStatus) => {
        const response = await axiosInstance.patch<RegularizationResponse>(
            `${ATTENDANCE_BASE_URL}/regularizations/${id}/review`,
            null,
            { params: { status } }
        );
        return response.data;
    }
};
