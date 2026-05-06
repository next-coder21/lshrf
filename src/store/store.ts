import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/store/authSlice';
import employeesReducer from '@/features/employees/store/employeeSlice';
import attendanceReducer from '@/features/attendance/store/attendanceSlice';
import leaveReducer from '@/features/leaves/store/leaveSlice';
import payrollReducer from '@/features/payroll/store/payrollSlice';
import performanceReducer from '@/features/performance/store/performanceSlice';
import billingReducer from '@/features/plans/store/billingSlice';
import recruitmentReducer from '@/features/recruitment/store/recruitmentSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        employees: employeesReducer,
        attendance: attendanceReducer,
        leaves: leaveReducer,
        payroll: payrollReducer,
        performance: performanceReducer,
        billing: billingReducer,
        recruitment: recruitmentReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
