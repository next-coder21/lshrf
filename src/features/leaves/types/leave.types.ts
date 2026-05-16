export type LeaveType = string;
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Leave {
    id: string;
    employeeId: string;
    employeeName: string;
    startDate: string;
    endDate: string;
    leaveTypeName: string;
    leaveTypeCode: string;
    status: LeaveStatus;
    reason: string;
    adminComments?: string;
    appliedDate: string;
}

export interface LeaveRequest {
    employeeId: string;
    startDate: string;
    endDate: string;
    leaveTypeConfigId: string;
    reason: string;
}

export interface LeaveTypeConfig {
    id: string;
    name: string;
    code: string;
    description: string;
    daysCredited: number;
    creditFrequency: string;
    isPaid: boolean;
    isActive: boolean;
}

export interface LeaveBalance {
    leaveTypeName: string;
    totalDays: number;
    usedDays: number;
    remainingDays: number;
}

export interface CreateLeaveTypeRequest {
    name: string;
    code: string;
    description: string;
    daysCredited: number;
    creditFrequency: string;
    isPaid: boolean;
    isActive: boolean;
}
