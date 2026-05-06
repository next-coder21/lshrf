export interface Department {
    id: string;
    name: string;
    description?: string;
    tenantId: string;
    tenantName: string;
    headUserId?: string;
    headUserName?: string;
    headUserEmail?: string;
    employeeCount: number;
    createdAt: string;
}

export interface DepartmentRequest {
    name: string;
    description?: string;
    headUserId?: string | null;
    tenantId?: string;
}
