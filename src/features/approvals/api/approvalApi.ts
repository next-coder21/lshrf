import axiosInstance from '@/lib/api/axiosInstance';
import { WorkflowDefinition, WorkflowInstance } from '../types/approval.types';

const BASE_URL = '/approvals';

export const approvalApi = {
    getDefinitions: async () => {
        const response = await axiosInstance.get<WorkflowDefinition[]>(`${BASE_URL}/definitions`);
        return response.data;
    },
    createDefinition: async (data: Partial<WorkflowDefinition>) => {
        const response = await axiosInstance.post<WorkflowDefinition>(`${BASE_URL}/definitions`, data);
        return response.data;
    },
    getInstance: async (id: string) => {
        const response = await axiosInstance.get<WorkflowInstance>(`${BASE_URL}/instances/${id}`);
        return response.data;
    },
    approve: async (id: string, comment: string, actorId: string) => {
        const response = await axiosInstance.post<WorkflowInstance>(`${BASE_URL}/instances/${id}/approve`, null, {
            params: { comment, actorId }
        });
        return response.data;
    },
    reject: async (id: string, comment: string, actorId: string) => {
        const response = await axiosInstance.post<WorkflowInstance>(`${BASE_URL}/instances/${id}/reject`, null, {
            params: { comment, actorId }
        });
        return response.data;
    },
    getMyPending: async (userId: string) => {
        const response = await axiosInstance.get<WorkflowInstance[]>(`${BASE_URL}/my-pending`, {
            params: { userId }
        });
        return response.data;
    }
};
