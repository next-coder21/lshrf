import axios from '@/lib/api/axiosInstance';
import type { 
    Invoice, 
    BillingSummary, 
    BillingEvent, 
    ResourceLimit, 
    InvoiceCreateRequest, 
    InvoiceStatusUpdate 
} from '../types/billing.types';

export const billingApi = {
    getAllSummaries: () =>
        axios.get<BillingSummary[]>('/billing/summary').then(res => res.data),

    getTenantSummary: (tenantId: string) =>
        axios.get<BillingSummary>(`/billing/summary/${tenantId}`).then(res => res.data),

    getAllInvoices: (page = 0, size = 50) =>
        axios.get<{content: Invoice[]}>(`/billing/invoices?page=${page}&size=${size}`).then(res => res.data.content),

    getTenantInvoices: (tenantId: string, page = 0, size = 50) =>
        axios.get<{content: Invoice[]}>(`/billing/invoices/${tenantId}?page=${page}&size=${size}`).then(res => res.data.content),

    createInvoice: (tenantId: string, data: InvoiceCreateRequest) =>
        axios.post<Invoice>(`/billing/invoices/${tenantId}`, data).then(res => res.data),

    updateInvoiceStatus: (invoiceId: string, data: InvoiceStatusUpdate) =>
        axios.patch<Invoice>(`/billing/invoices/${invoiceId}/status`, data).then(res => res.data),

    getBillingEvents: (tenantId: string) =>
        axios.get<BillingEvent[]>(`/billing/events/${tenantId}`).then(res => res.data),

    getAllResourceLimits: () =>
        axios.get<ResourceLimit[]>('/billing/resource-limits').then(res => res.data),

    getTenantResourceLimit: (tenantId: string) =>
        axios.get<ResourceLimit>(`/billing/resource-limits/${tenantId}`).then(res => res.data),

    downloadInvoicePdf: (invoiceId: string) =>
        axios.get(`/billing/invoices/${invoiceId}/pdf`, { responseType: 'arraybuffer' }).then(res => res.data),
};
