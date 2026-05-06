import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Leave, LeaveRequest, LeaveStatus } from '../types/leave.types';
import { leaveApi } from '../api/leaveApi';

interface LeaveState {
    leaves: Leave[];
    loading: boolean;
    error: string | null;
}

const initialState: LeaveState = {
    leaves: [],
    loading: false,
    error: null,
};

export const fetchLeaves = createAsyncThunk('leaves/fetchAll', async () => {
    return await leaveApi.getAll();
});

export const applyLeave = createAsyncThunk('leaves/apply', async (data: LeaveRequest) => {
    return await leaveApi.apply(data);
});

export const updateLeaveStatus = createAsyncThunk(
    'leaves/updateStatus',
    async ({ id, status, comments }: { id: string; status: LeaveStatus; comments?: string }) => {
        return await leaveApi.updateStatus(id, status, comments);
    }
);

const leaveSlice = createSlice({
    name: 'leaves',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLeaves.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLeaves.fulfilled, (state, action: PayloadAction<Leave[]>) => {
                state.loading = false;
                state.leaves = action.payload;
            })
            .addCase(fetchLeaves.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch leaves';
            })
            .addCase(applyLeave.fulfilled, (state, action: PayloadAction<Leave>) => {
                state.leaves.unshift(action.payload);
            })
            .addCase(updateLeaveStatus.fulfilled, (state, action: PayloadAction<Leave>) => {
                const index = state.leaves.findIndex(l => l.id === action.payload.id);
                if (index !== -1) {
                    state.leaves[index] = action.payload;
                }
            });
    },
});

export default leaveSlice.reducer;
