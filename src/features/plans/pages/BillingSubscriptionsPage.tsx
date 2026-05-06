import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllSummaries, fetchTenantSummary } from '../store/billingSlice';
import { CreditCard, ShieldCheck, Building2, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const BillingSubscriptionsPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector(state => state.auth);
    const { summaries, loading } = useAppSelector(state => state.billing);
    
    const isSuperAdmin = user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'SUPER_ADMIN';

    useEffect(() => {
        if (isSuperAdmin) {
            dispatch(fetchAllSummaries());
        } else if (user?.tenantId) {
            dispatch(fetchTenantSummary(user.tenantId));
        }
    }, [dispatch, isSuperAdmin, user?.tenantId]);

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-[18px] font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
                        <CreditCard className="w-6 h-6 text-red-600" />
                        Billing & <span className="text-red-600">Subscriptions</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-[14px]">
                        Manage {isSuperAdmin ? "all organizations'" : "your organization's"} subscription and billing details
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
                                {isSuperAdmin && <th className="px-8 py-5">Tenant</th>}
                                <th className="px-8 py-5">Plan</th>
                                <th className="px-8 py-5">Seats</th>
                                <th className="px-8 py-5">Monthly Cost</th>
                                <th className="px-8 py-5">Next Billing</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={7} className="px-8 py-10 text-center text-gray-400 font-bold animate-pulse">Loading...</td></tr>
                            ) : summaries.length === 0 ? (
                                <tr><td colSpan={7} className="px-8 py-10 text-center text-gray-400 font-bold text-[12px] uppercase">No subscriptions found</td></tr>
                            ) : summaries.map(summary => (
                                <tr key={summary.tenantId} className="group hover:bg-gray-50/50 transition-all">
                                    {isSuperAdmin && (
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-[12px]">
                                                    {summary.tenantName?.substring(0, 2).toUpperCase() || 'NA'}
                                                </div>
                                                <span className="text-[13px] font-black text-gray-900 uppercase">{summary.tenantName}</span>
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-8 py-5 text-[13px] font-black text-gray-900 uppercase">
                                        {summary.planName || 'No Plan'}
                                    </td>
                                    <td className="px-8 py-5 font-bold text-gray-600 text-[13px]">
                                        {summary.seatsCount} Users
                                    </td>
                                    <td className="px-8 py-5 font-black text-gray-900 text-[13px]">
                                        ${summary.totalMonthlyCost?.toFixed(2) || '0.00'}
                                    </td>
                                    <td className="px-8 py-5 text-[13px] font-bold text-gray-500">
                                        {summary.nextBillingDate ? format(new Date(summary.nextBillingDate), 'MMM dd, yyyy') : 'N/A'}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className={clsx(
                                            "inline-flex items-center gap-1.5 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full",
                                            summary.status === 'ACTIVE' ? "bg-green-50 text-green-600" :
                                            summary.status === 'TRIAL' ? "bg-yellow-50 text-yellow-600" :
                                            "bg-red-50 text-red-600"
                                        )}>
                                            <div className={clsx("w-1.5 h-1.5 rounded-full",
                                                summary.status === 'ACTIVE' ? "bg-green-600" :
                                                summary.status === 'TRIAL' ? "bg-yellow-600" :
                                                "bg-red-600"
                                            )}></div>
                                            {summary.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button 
                                            onClick={() => navigate('/plans/pay')}
                                            className="px-4 py-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all"
                                        >
                                            View Invoices
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
