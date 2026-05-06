import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    tenantId?: string;
    permissions: string[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

// Helper functions for localStorage
const getStoredUser = (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

const initialState: AuthState = {
    user: getStoredUser(),
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
