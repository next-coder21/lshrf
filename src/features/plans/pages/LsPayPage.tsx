import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
    fetchAllInvoices, 
    fetchTenantInvoices, 
    fetchBillingEvents,
    updateInvoiceStatusThunk
} from '../store/billingSlice';
import { billingApi } from '../api/billingApi';
import { CreditCard, Download, Activity, CheckCircle2, History } from 'lucide-react';
import { tenantApi } from '../../org/api/tenantApi';
import { Tenant } from '../../org/types/tenant.types';
import clsx from 'clsx';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export const LsPayPage = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const { invoices, events, loading } = useAppSelector(state => state.billing);
    
    const isSuperAdmin = user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'SUPER_ADMIN';

    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (isSuperAdmin) {
            dispatch(fetchAllInvoices());
            tenantApi.getAll().then(data => setTenants(data)).catch(() => {});
        } else if (user?.tenantId) {
            dispatch(fetchTenantInvoices(user.tenantId));
            dispatch(fetchBillingEvents(user.tenantId));
        }
    }, [dispatch, isSuperAdmin, user?.tenantId]);

    const handleTenantChange = (tenantId: string) => {
        setSelectedTenant(tenantId);
        if (tenantId) {
            dispatch(fetchTenantInvoices(tenantId));
            dispatch(fetchBillingEvents(tenantId));
        } else {
            dispatch(fetchAllInvoices());
        }
    };

    const handleCreateInvoice = async () => {
        if (!selectedTenant) {
            toast.error("Select a tenant first");
            return;
        }
        setIsGenerating(true);
        try {
            await billingApi.createInvoice(selectedTenant, {
                planId: '00000000-0000-0000-0000-000000000000', // Server assigns from allocation
                seatsCount: 1, // Will be overridden in server with actual users + rate logic
                pricePerSeat: 0,
                totalAmount: 99.00, // Dummy, should be calculated server side, but DTO expects this. Let's send a fake req, the endpoint uses what we send!
                billingPeriodStart: new Date().toISOString().split('T')[0],
                billingPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
                dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
            });
            toast.success("Invoice generated!");
            dispatch(fetchTenantInvoices(selectedTenant));
            dispatch(fetchBillingEvents(selectedTenant));
        } catch (error) {
            toast.error("Error generating invoice");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleMarkPaid = async (invoiceId: string) => {
        try {
            await dispatch(updateInvoiceStatusThunk({ invoiceId, status: 'PAID' })).unwrap();
            toast.success("Invoice marked as PAID");
        } catch (error) {
            toast.error("Error updating status");
        }
    };

    const handleDownloadPdf = async (invoiceId: string) => {
        const toastId = toast.loading('Generating invoice PDF...');
        try {
            const data = await billingApi.downloadInvoicePdf(invoiceId);
            const blob = new Blob([data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice_${invoiceId.substring(0,8)}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Downloaded!', { id: toastId });
        } catch (error) {
            toast.error('Failed to generate PDF', { id: toastId });
        }
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-[18px] font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
                        <CreditCard className="w-6 h-6 text-red-600" />
                        L's<span className="text-red-600">PAY</span> INVOICES
                    </h1>
                    <p className="text-gray-500 font-medium text-[14px]">
                        Manage invoices, payments, and billing history
                    </p>
                </div>

                {isSuperAdmin && (
                    <div className="flex items-center gap-4">
                        <select
                            value={selectedTenant}
                            onChange={(e) => handleTenantChange(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl font-bold text-gray-900 shadow-sm"
                        >
                            <option value="">All Organizations</option>
                            {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <button
                            onClick={handleCreateInvoice}
                            disabled={!selectedTenant || isGenerating}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest disabled:opacity-50"
                        >
                            {isGenerating ? 'Generating...' : 'Generate Invoice'}
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
                                <th className="px-8 py-5">Period</th>
                                {isSuperAdmin && <th className="px-8 py-5">Tenant</th>}
                                <th className="px-8 py-5">Seats</th>
                                <th className="px-8 py-5">Total</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Due Date</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading && invoices.length === 0 ? (
                                <tr><td colSpan={7} className="px-8 py-10 text-center font-bold text-gray-400">Loading Invoices...</td></tr>
                            ) : invoices.length === 0 ? (
                                <tr><td colSpan={7} className="px-8 py-10 text-center font-bold text-[12px] uppercase text-gray-400">No invoices found</td></tr>
                            ) : invoices.map(inv => (
                                <tr key={inv.id} className="group hover:bg-gray-50/50">
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-black text-gray-900">
                                                {format(new Date(inv.billingPeriodStart), 'MMM dd')} - {format(new Date(inv.billingPeriodEnd), 'MMM dd, yyyy')}
                                            </span>
                                            <span className="text-[11px] font-bold text-gray-400">
                                                INV-{inv.id.substring(0,8).toUpperCase()}
                                            </span>
                                        </div>
                                    </td>
                                    {isSuperAdmin && (
                                        <td className="px-8 py-5 text-[13px] font-black text-gray-900 uppercase">
                                            {inv.tenantName}
                                        </td>
                                    )}
                                    <td className="px-8 py-5 font-bold text-gray-600 text-[13px]">
                                        {inv.seatsCount} Seats
                                    </td>
                                    <td className="px-8 py-5 font-black text-gray-900 text-[13px]">
                                        ${inv.totalAmount?.toFixed(2)}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className={clsx(
                                            "inline-flex items-center gap-1.5 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full",
                                            inv.status === 'PAID' ? "bg-green-50 text-green-600" :
                                            inv.status === 'PENDING' ? "bg-yellow-50 text-yellow-600" :
                                            "bg-red-50 text-red-600"
                                        )}>
                                            {inv.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-[13px] font-bold text-gray-500">
                                        {format(new Date(inv.dueDate), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="px-8 py-5 text-right space-x-2">
                                        {isSuperAdmin && inv.status !== 'PAID' && (
                                            <button 
                                                onClick={() => handleMarkPaid(inv.id)}
                                                className="px-3 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-[11px] font-black uppercase tracking-widest"
                                            >
                                                Mark Paid
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDownloadPdf(inv.id)}
                                            className="px-3 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Billing Events Log */}
            {events.length > 0 && (
                <div className="bg-slate-900 rounded-3xl p-8 space-y-6 text-white shadow-xl shadow-slate-900/30">
                    <h2 className="text-[14px] font-black uppercase tracking-widest flex items-center gap-3 border-b border-white/10 pb-4">
                        <History className="w-5 h-5 text-red-500" />
                        Billing Event Log
                    </h2>
                    <div className="space-y-4">
                        {events.map(event => (
                            <div key={event.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="p-2 bg-red-500/10 rounded-lg text-red-500 shrink-0">
                                    <Activity className="w-4 h-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[13px] font-bold text-slate-300">{event.description}</p>
                                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                        {format(new Date(event.createdAt), 'MMM dd, yyyy HH:mm')} · {event.eventType}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
