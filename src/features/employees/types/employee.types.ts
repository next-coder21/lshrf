export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE';

export interface Employee {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    departmentId?: string;
    department?: string;
    designation: string;
    dateOfJoining: string;
    salary: number;
    status: EmploymentStatus;
    tenantName?: string;
    linkedUserId?: string;
    linkedUserEmail?: string;
    linkedUserName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface EmployeeRequest {
    employeeId?: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    departmentId?: string;
    designation: string;
    dateOfJoining?: string;
    salary: number;
    status: EmploymentStatus;
    linkedUserId?: string | null;
}
