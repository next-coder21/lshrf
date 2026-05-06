import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { billingApi } from '../api/billingApi';
import type { Invoice, BillingSummary, BillingEvent, ResourceLimit } from '../types/billing.types';

interface BillingState {
    summaries: BillingSummary[];
    invoices: Invoice[];
    events: BillingEvent[];
    resourceLimits: ResourceLimit[];
    loading: boolean;
    error: string | null;
}

const initialState: BillingState = {
    summaries: [],
    invoices: [],
    events: [],
    resourceLimits: [],
    loading: false,
    error: null,
};

export const fetchAllSummaries = createAsyncThunk(
    'billing/fetchAllSummaries',
    async () => await billingApi.getAllSummaries()
);

export const fetchTenantSummary = createAsyncThunk(
    'billing/fetchTenantSummary',
    async (tenantId: string) => await billingApi.getTenantSummary(tenantId)
);

export const fetchAllInvoices = createAsyncThunk(
    'billing/fetchAllInvoices',
    async () => await billingApi.getAllInvoices()
);

export const fetchTenantInvoices = createAsyncThunk(
    'billing/fetchTenantInvoices',
    async (tenantId: string) => await billingApi.getTenantInvoices(tenantId)
);

export const fetchBillingEvents = createAsyncThunk(
    'billing/fetchBillingEvents',
    async (tenantId: string) => await billingApi.getBillingEvents(tenantId)
);

export const fetchAllResourceLimits = createAsyncThunk(
    'billing/fetchAllResourceLimits',
    async () => await billingApi.getAllResourceLimits()
);

export const fetchTenantResourceLimit = createAsyncThunk(
    'billing/fetchTenantResourceLimit',
    async (tenantId: string) => await billingApi.getTenantResourceLimit(tenantId)
);

export const updateInvoiceStatusThunk = createAsyncThunk(
    'billing/updateInvoiceStatus',
    async ({ invoiceId, status }: { invoiceId: string; status: 'PENDING' | 'PAID' | 'OVERDUE' }) => {
        return await billingApi.updateInvoiceStatus(invoiceId, { status });
    }
);

const billingSlice = createSlice({
    name: 'billing',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Summaries
            .addCase(fetchAllSummaries.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAllSummaries.fulfilled, (state, action) => {
                state.loading = false;
                state.summaries = action.payload;
            })
            .addCase(fetchAllSummaries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch summaries';
            })
            .addCase(fetchTenantSummary.fulfilled, (state, action) => {
                state.summaries = [action.payload];
            })
            // Invoices
            .addCase(fetchAllInvoices.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAllInvoices.fulfilled, (state, action) => {
                state.loading = false;
                state.invoices = action.payload;
            })
            .addCase(fetchAllInvoices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch invoices';
            })
            .addCase(fetchTenantInvoices.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchTenantInvoices.fulfilled, (state, action) => {
                state.loading = false;
                state.invoices = action.payload;
            })
            // Events
            .addCase(fetchBillingEvents.fulfilled, (state, action) => {
                state.events = action.payload;
            })
            // Limits
            .addCase(fetchAllResourceLimits.pending, (state) => { state.loading = true; })
            .addCase(fetchAllResourceLimits.fulfilled, (state, action) => {
                state.loading = false;
                state.resourceLimits = action.payload;
            })
            .addCase(fetchTenantResourceLimit.fulfilled, (state, action) => {
                state.resourceLimits = [action.payload];
            })
            // Update Status
            .addCase(updateInvoiceStatusThunk.fulfilled, (state, action) => {
                const index = state.invoices.findIndex(inv => inv.id === action.payload.id);
                if (index !== -1) {
                    state.invoices[index] = action.payload;
                }
            });
    },
});

export const { clearError } = billingSlice.actions;
export default billingSlice.reducer;
