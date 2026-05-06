import axios from '@/lib/api/axiosInstance';
import type {
    Shift,
    ShiftAssignment,
    CreateShiftRequest,
    UpdateShiftRequest,
    AssignShiftRequest,
    UpdateAssignmentRequest,
} from '../types/shift.types';

export const shiftApi = {
    // Shift CRUD
    getAllShifts: () =>
        axios.get<Shift[]>('/shifts').then(res => res.data),

    getActiveShifts: () =>
        axios.get<Shift[]>('/shifts/active').then(res => res.data),

    getShiftById: (id: string) =>
        axios.get<Shift>(`/shifts/${id}`).then(res => res.data),

    getShiftsByType: (type: string) =>
        axios.get<Shift[]>(`/shifts/type/${type}`).then(res => res.data),

    createShift: (data: CreateShiftRequest) =>
        axios.post<Shift>('/shifts', data).then(res => res.data),

    updateShift: (id: string, data: UpdateShiftRequest) =>
        axios.put<Shift>(`/shifts/${id}`, data).then(res => res.data),

    deleteShift: (id: string) =>
        axios.delete(`/shifts/${id}`).then(res => res.data),

    // Shift Assignments
    getAllActiveAssignments: () =>
        axios.get<ShiftAssignment[]>('/shift-assignments').then(res => res.data),

    getAssignmentById: (id: string) =>
        axios.get<ShiftAssignment>(`/shift-assignments/${id}`).then(res => res.data),

    assignShift: (data: AssignShiftRequest) =>
        axios.post<ShiftAssignment>('/shift-assignments', data).then(res => res.data),

    updateAssignment: (id: string, data: UpdateAssignmentRequest) =>
        axios.put<ShiftAssignment>(`/shift-assignments/${id}`, data).then(res => res.data),

    cancelAssignment: (id: string) =>
        axios.delete(`/shift-assignments/${id}`).then(res => res.data),

    getEmployeeAssignments: (employeeId: string) =>
        axios.get<ShiftAssignment[]>(`/shift-assignments/employee/${employeeId}`).then(res => res.data),

    getShiftAssignments: (shiftId: string) =>
        axios.get<ShiftAssignment[]>(`/shift-assignments/shift/${shiftId}`).then(res => res.data),

    getActiveAssignmentForDate: (employeeId: string, date?: string) => {
        const params = date ? `?date=${date}` : '';
        return axios.get<ShiftAssignment>(`/shift-assignments/employee/${employeeId}/active${params}`).then(res => res.data);
    },
};
