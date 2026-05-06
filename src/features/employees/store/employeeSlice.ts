import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Employee } from '../types/employee.types';
import { employeeApi } from '../api/employeeApi';

interface EmployeeState {
    employees: Employee[];
    loading: boolean;
    error: string | null;
}

const initialState: EmployeeState = {
    employees: [],
    loading: false,
    error: null,
};

export const fetchEmployees = createAsyncThunk(
    'employees/fetchAll',
    async () => {
        return await employeeApi.getAll();
    }
);

const employeeSlice = createSlice({
    name: 'employees',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchEmployees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployees.fulfilled, (state, action: PayloadAction<Employee[]>) => {
                state.loading = false;
                state.employees = action.payload;
            })
            .addCase(fetchEmployees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch employees';
            });
    },
});

export default employeeSlice.reducer;
