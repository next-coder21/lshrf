import axios, { AxiosRequestConfig } from 'axios';
import { store } from '@/store/store';
import { setToken, logout } from '@/features/auth/store/authSlice';

export const API_URL = import.meta.env.VITE_API_URL as string;

export const extractErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message
            || error.response?.data?.error
            || error.message
            || 'Request failed';
    }
    return error instanceof Error ? error.message : 'Unknown error';
};

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Tracks whether a refresh is already in flight.
let isRefreshing = false;

// Queue of resolve/reject callbacks for requests that arrived while a refresh was in flight.
type QueueEntry = {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
};
let waitQueue: QueueEntry[] = [];

function drainQueue(token: string): void {
    waitQueue.forEach((entry) => entry.resolve(token));
    waitQueue = [];
}

function rejectQueue(error: unknown): void {
    waitQueue.forEach((entry) => entry.reject(error));
    waitQueue = [];
}

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Prevent refresh loops: if the failing request was itself the refresh call, log out.
        if (originalRequest.url?.endsWith('/auth/refresh')) {
            store.dispatch(logout());
            window.location.href = '/login';
            return Promise.reject(error);
        }

        if (isRefreshing) {
            // Park this request until the in-flight refresh completes.
            return new Promise<string>((resolve, reject) => {
                waitQueue.push({ resolve, reject });
            }).then((newToken) => {
                if (!originalRequest.headers) {
                    originalRequest.headers = {};
                }
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                originalRequest._retry = true;
                return axiosInstance(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const storedRefreshToken = localStorage.getItem('refreshToken');

        if (!storedRefreshToken) {
            store.dispatch(logout());
            window.location.href = '/login';
            isRefreshing = false;
            return Promise.reject(error);
        }

        try {
            const { data } = await axiosInstance.post<{ token: string }>('/api/v1/auth/refresh', {
                refreshToken: storedRefreshToken,
            });

            const newToken = data.token;
            store.dispatch(setToken(newToken));
            drainQueue(newToken);

            if (!originalRequest.headers) {
                originalRequest.headers = {};
            }
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
        } catch (refreshError) {
            rejectQueue(refreshError);
            store.dispatch(logout());
            window.location.href = '/login';
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default axiosInstance;
