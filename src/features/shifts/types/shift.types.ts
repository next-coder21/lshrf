export interface Shift {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    breakDurationMinutes: number | null;
    description?: string;
    shiftType: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'GENERAL';
    isActive: boolean;
    tenantId: string;
    tenantName: string;
    formattedTimeRange: string;
    workingHoursInMinutes: number;
    createdAt: string;
    updatedAt: string;
}

export interface ShiftAssignment {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeId_code: string;
    shiftId: string;
    shiftName: string;
    shiftStartTime: string;
    shiftEndTime: string;
    effectiveFrom: string;
    effectiveTo?: string;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    notes?: string;
    tenantId: string;
    isOngoing: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateShiftRequest {
    name: string;
    startTime: string;
    endTime: string;
    breakDurationMinutes?: number;
    description?: string;
    shiftType: string;
}

export interface UpdateShiftRequest {
    name?: string;
    startTime?: string;
    endTime?: string;
    breakDurationMinutes?: number;
    description?: string;
    shiftType?: string;
    isActive?: boolean;
}

export interface AssignShiftRequest {
    employeeId: string;
    shiftId: string;
    effectiveFrom: string;
    effectiveTo?: string;
    notes?: string;
}

export interface UpdateAssignmentRequest {
    effectiveFrom?: string;
    effectiveTo?: string;
    notes?: string;
    status?: string;
}
