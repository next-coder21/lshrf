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
    refreshToken: string | null;
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
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User; token: string; refreshToken?: string }>) => {
            const { user, token, refreshToken } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;
            if (refreshToken !== undefined) {
                state.refreshToken = refreshToken;
                localStorage.setItem('refreshToken', refreshToken);
            }
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
            localStorage.setItem('token', action.payload);
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        },
    },
});

export const { setCredentials, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
