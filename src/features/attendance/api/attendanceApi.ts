import axiosInstance from '@/lib/api/axiosInstance';
import { Attendance, AttendanceRequest } from '../types/attendance.types';

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
    }
};
