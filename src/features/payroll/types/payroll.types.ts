export type PayrollStatus = 'PENDING' | 'PROCESSED' | 'PAID' | 'CANCELLED';

export interface Payroll {
    id: string;
    employeeId: string;
    employeeName: string;
    month: number;
    year: number;
    baseSalary: number;
    bonuses: number;
    deductions: number;
    netSalary: number;
    status: PayrollStatus;
    paymentDate?: string;
    paymentMethod?: string;
    remarks?: string;
}

export interface PayrollRequest {
    employeeId: string;
    month: number;
    year: number;
    baseSalary: number;
    bonuses: number;
    deductions: number;
    paymentMethod?: string;
    remarks?: string;
}
