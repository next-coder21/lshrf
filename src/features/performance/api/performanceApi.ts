import axiosInstance from '@/lib/api/axiosInstance';
import { PerformanceReview, PerformanceReviewRequest } from '../types/performance.types';

const PERFORMANCE_BASE_URL = '/performance';

export const performanceApi = {
    getAll: async () => {
        const response = await axiosInstance.get<PerformanceReview[]>(PERFORMANCE_BASE_URL);
        return response.data;
    },
    create: async (data: PerformanceReviewRequest) => {
        const response = await axiosInstance.post<PerformanceReview>(PERFORMANCE_BASE_URL, data);
        return response.data;
    },
    update: async (id: string, data: PerformanceReviewRequest) => {
        const response = await axiosInstance.put<PerformanceReview>(`${PERFORMANCE_BASE_URL}/${id}`, data);
        return response.data;
    },
    getByEmployee: async (employeeId: string) => {
        const response = await axiosInstance.get<PerformanceReview[]>(`${PERFORMANCE_BASE_URL}/employee/${employeeId}`);
        return response.data;
    },
    delete: async (id: string) => {
        await axiosInstance.delete(`${PERFORMANCE_BASE_URL}/${id}`);
    }
};
