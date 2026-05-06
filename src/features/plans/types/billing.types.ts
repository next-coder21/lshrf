export interface Invoice {
    id: string;
    tenantId: string;
    tenantName: string;
    planId: string;
    planName: string;
    seatsCount: number;
    pricePerSeat: number;
    totalAmount: number;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
    billingPeriodStart: string;
    billingPeriodEnd: string;
    dueDate: string;
    paidAt: string | null;
    createdAt: string;
}

export interface BillingSummary {
    tenantId: string;
    tenantName: string;
    planName: string;
    seatsCount: number;
    pricePerSeat: number;
    totalMonthlyCost: number;
    nextBillingDate: string;
    status: 'ACTIVE' | 'OVERDUE' | 'TRIAL' | 'INACTIVE';
}

export interface BillingEvent {
    id: string;
    tenantId: string;
    eventType: string;
    description: string;
    amount: number | null;
    createdAt: string;
}

export interface ResourceLimit {
    tenantId: string;
    tenantName: string;
    planName: string;
    maxUsers: number;
    maxEmployees: number;
    currentUsers: number;
    currentEmployees: number;
    storageLimit: number;
    storageUsed: number;
    isWithinLimits: boolean;
}

export interface InvoiceCreateRequest {
    planId: string;
    seatsCount: number;
    pricePerSeat: number;
    totalAmount: number;
    billingPeriodStart: string;
    billingPeriodEnd: string;
    dueDate: string;
}

export interface InvoiceStatusUpdate {
    status: 'PENDING' | 'PAID' | 'OVERDUE';
}
