import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Attendance, AttendanceRequest } from '../types/attendance.types';
import { attendanceApi } from '../api/attendanceApi';

interface AttendanceState {
    logs: Attendance[];
    loading: boolean;
    error: string | null;
}

const initialState: AttendanceState = {
    logs: [],
    loading: false,
    error: null,
};

export const fetchAttendance = createAsyncThunk(
    'attendance/fetchAll',
    async () => {
        return await attendanceApi.getAll();
    }
);

export const checkIn = createAsyncThunk(
    'attendance/checkIn',
    async (data: AttendanceRequest) => {
        return await attendanceApi.checkIn(data);
    }
);

export const checkOut = createAsyncThunk(
    'attendance/checkOut',
    async (data: AttendanceRequest) => {
        return await attendanceApi.checkOut(data);
    }
);

const attendanceSlice = createSlice({
    name: 'attendance',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAttendance.fulfilled, (state, action: PayloadAction<Attendance[]>) => {
                state.loading = false;
                state.logs = action.payload;
            })
            .addCase(fetchAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch attendance';
            })
            .addCase(checkIn.fulfilled, (state, action: PayloadAction<Attendance>) => {
                state.logs.unshift(action.payload);
            })
            .addCase(checkOut.fulfilled, (state, action: PayloadAction<Attendance>) => {
                const index = state.logs.findIndex(log => log.id === action.payload.id);
                if (index !== -1) {
                    state.logs[index] = action.payload;
                }
            });
    },
});

export default attendanceSlice.reducer;
