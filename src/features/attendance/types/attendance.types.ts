export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE';

export type RegularizationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface RegularizationRequest {
    date: string;
    requestedCheckIn: string;
    requestedCheckOut: string;
    reason: string;
}

export interface RegularizationResponse {
    id: string;
    tenantId: string;
    employeeId: string;
    employeeName: string;
    date: string;
    requestedCheckIn: string;
    requestedCheckOut: string;
    reason: string;
    status: RegularizationStatus;
    reviewedBy: string | null;
    createdAt: string;
}

export interface Attendance {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status: AttendanceStatus;
    notes?: string;
    checkInLocation?: string;
    checkOutLocation?: string;
    workDurationMinutes?: number;
}

export interface AttendanceRequest {
    employeeId: string;
    notes?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
}
