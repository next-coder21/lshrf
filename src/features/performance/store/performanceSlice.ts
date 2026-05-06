import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PerformanceReview, PerformanceReviewRequest } from '../types/performance.types';
import { performanceApi } from '../api/performanceApi';

interface PerformanceState {
    reviews: PerformanceReview[];
    loading: boolean;
    error: string | null;
}

const initialState: PerformanceState = {
    reviews: [],
    loading: false,
    error: null,
};

export const fetchReviews = createAsyncThunk('performance/fetchAll', async () => {
    return await performanceApi.getAll();
});

export const createReview = createAsyncThunk('performance/create', async (data: PerformanceReviewRequest) => {
    return await performanceApi.create(data);
});

const performanceSlice = createSlice({
    name: 'performance',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReviews.fulfilled, (state, action: PayloadAction<PerformanceReview[]>) => {
                state.loading = false;
                state.reviews = action.payload;
            })
            .addCase(fetchReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch reviews';
            })
            .addCase(createReview.fulfilled, (state, action: PayloadAction<PerformanceReview>) => {
                state.reviews.unshift(action.payload);
            });
    },
});

export default performanceSlice.reducer;
