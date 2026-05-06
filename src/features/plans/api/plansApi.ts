import axiosInstance from '@/lib/api/axiosInstance';
import { Plan, PlanAllocation, PlanAllocationRequest, ResourceUsage, Subscription, Invoice } from '../types/plans.types';

const PLANS_BASE_URL = '/plans';
const ALLOCATIONS_BASE_URL = '/plan-allocations';

export const plansApi = {
    // Plan Definitions
    getAllPlans: async () => {
        const response = await axiosInstance.get<Plan[]>(PLANS_BASE_URL);
        return response.data;
    },
    getPlanById: async (id: string) => {
        const response = await axiosInstance.get<Plan>(`${PLANS_BASE_URL}/${id}`);
        return response.data;
    },
    createPlan: async (data: Partial<Plan>) => {
        const response = await axiosInstance.post<Plan>(PLANS_BASE_URL, data);
        return response.data;
    },
    updatePlan: async (id: string, data: Partial<Plan>) => {
        const response = await axiosInstance.put<Plan>(`${PLANS_BASE_URL}/${id}`, data);
        return response.data;
    },
    deletePlan: async (id: string) => {
        await axiosInstance.delete(`${PLANS_BASE_URL}/${id}`);
    },

    // Plan Allocations
    getAllAllocations: async () => {
        const response = await axiosInstance.get<PlanAllocation[]>(ALLOCATIONS_BASE_URL);
        return response.data;
    },
    getActiveAllocation: async (tenantId: string) => {
        const response = await axiosInstance.get<PlanAllocation>(`${ALLOCATIONS_BASE_URL}/active/${tenantId}`);
        return response.data;
    },
    allocatePlan: async (data: PlanAllocationRequest) => {
        const response = await axiosInstance.post<PlanAllocation>(ALLOCATIONS_BASE_URL, data);
        return response.data;
    },
    deactivateAllocation: async (id: string) => {
        await axiosInstance.delete(`${ALLOCATIONS_BASE_URL}/${id}`);
    },
    getTenantHistory: async (tenantId: string) => {
        const response = await axiosInstance.get<PlanAllocation[]>(`${ALLOCATIONS_BASE_URL}/tenant/${tenantId}`);
        return response.data;
    },

    // Resource Limits
    getMyResourceUsage: async () => {
        const response = await axiosInstance.get<ResourceUsage>('/resource-limits/my-usage');
        return response.data;
    },
    getUsageByTenantId: async (tenantId: string) => {
        const response = await axiosInstance.get<ResourceUsage>(`/resource-limits/usage/${tenantId}`);
        return response.data;
    },
    getAllResourceUsage: async () => {
        const response = await axiosInstance.get<ResourceUsage[]>('/resource-limits/usage');
        return response.data;
    },

    // Billing
    getSubscription: async () => {
        const response = await axiosInstance.get<Subscription>('/billing/subscription');
        return response.data;
    },
    getBillingHistory: async () => {
        const response = await axiosInstance.get<Invoice[]>('/billing/history');
        return response.data;
    },
    processPayment: async (data: { amount: number; paymentMethod: string }) => {
        await axiosInstance.post('/billing/pay', data);
    }
};
