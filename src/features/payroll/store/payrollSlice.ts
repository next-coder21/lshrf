import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Payroll, PayrollRequest, PayrollStatus } from '../types/payroll.types';
import { payrollApi } from '../api/payrollApi';

interface PayrollState {
    payrolls: Payroll[];
    loading: boolean;
    error: string | null;
}

const initialState: PayrollState = {
    payrolls: [],
    loading: false,
    error: null,
};

export const fetchPayrolls = createAsyncThunk('payroll/fetchAll', async () => {
    return await payrollApi.getAll();
});

export const processPayroll = createAsyncThunk('payroll/process', async (data: PayrollRequest) => {
    return await payrollApi.process(data);
});

export const updatePayrollStatus = createAsyncThunk(
    'payroll/updateStatus',
    async ({ id, status }: { id: string; status: PayrollStatus }) => {
        return await payrollApi.updateStatus(id, status);
    }
);

const payrollSlice = createSlice({
    name: 'payroll',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPayrolls.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPayrolls.fulfilled, (state, action: PayloadAction<Payroll[]>) => {
                state.loading = false;
                state.payrolls = action.payload;
            })
            .addCase(fetchPayrolls.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch payrolls';
            })
            .addCase(processPayroll.fulfilled, (state, action: PayloadAction<Payroll>) => {
                state.payrolls.unshift(action.payload);
            })
            .addCase(updatePayrollStatus.fulfilled, (state, action: PayloadAction<Payroll>) => {
                const index = state.payrolls.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.payrolls[index] = action.payload;
                }
            });
    },
});

export default payrollSlice.reducer;
