export interface Plan {
    id: string;
    name: string;
    description: string;
    maxUsers: number;
    maxEmployees: number;
    monthlyPrice: number;
    active: boolean;
}

export interface PlanAllocation {
    id: string;
    tenantId: string;
    tenantName: string;
    planId: string;
    planName: string;
    startDate: string;
    endDate?: string;
    active: boolean;
    remarks: string;
    customPricePerUser?: number;
}

export interface PlanAllocationRequest {
    tenantId: string;
    planId: string;
    remarks?: string;
    customPricePerUser?: number;
}

export interface ResourceUsage {
    tenantId: string;
    tenantName: string;
    activePlanName: string;
    currentUsers: number;
    maxUsers: number;
    currentEmployees: number;
    maxEmployees: number;
    userUsagePercentage: number;
    employeeUsagePercentage: number;
    isOverLimit: boolean;
    requiresUpgrade?: boolean;
    upgradeSuggestion?: string;
}

export interface Subscription {
    planId: string;
    planName: string;
    description: string;
    price: number;
    billingCycle: string;
    startDate: string;
    nextBillingDate: string;
    status: 'ACTIVE' | 'PENDING' | 'EXPIRED';
    autoRenew: boolean;
    baseFare: number;
    perUserRate: number;
    trialDaysLeft: number;
}

export interface Invoice {
    invoiceNumber: string;
    date: string;
    amount: number;
    status: string;
    paymentMethod?: string;
    downloadUrl: string;
}
