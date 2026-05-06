import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { plansApi } from '../api/plansApi';
import { tenantApi } from '../../org/api/tenantApi';
import { Plan, PlanAllocation } from '../types/plans.types';
import { Tenant } from '../../org/types/tenant.types';
import { useAppSelector } from '@/store/hooks';
import { Layers, Plus, Calendar, CheckCircle2, XCircle, Info, Building2, CreditCard } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

export const PlanAllocationPage = () => {
    const navigate = useNavigate();
    const { user } = useAppSelector(state => state.auth);
    const isSuperAdmin = user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'SUPER_ADMIN';

    const [allocations, setAllocations] = useState<PlanAllocation[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedTenant, setSelectedTenant] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('');
    const [customPrice, setCustomPrice] = useState('');
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isEnterprisePlan = plans.find(p => p.id === selectedPlan)?.name.toLowerCase().includes('enterprise');

    useEffect(() => {
        if (!isSuperAdmin) {
            navigate('/');
            return;
        }
        fetchData();
    }, [isSuperAdmin, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [allocData, planData, tenantData] = await Promise.all([
                plansApi.getAllAllocations(),
                plansApi.getAllPlans(),
                tenantApi.getAll()
            ]);
            setAllocations(allocData);
            setPlans(planData);
            setTenants(tenantData);
        } catch (error) {
            toast.error('Failed to load allocation data');
        } finally {
            setLoading(false);
        }
    };

    const handleAllocate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTenant || !selectedPlan) {
            toast.error('Please select both tenant and plan');
            return;
        }

        setSubmitting(true);
        try {
            await plansApi.allocatePlan({
                tenantId: selectedTenant,
                planId: selectedPlan,
                remarks,
                customPricePerUser: isEnterprisePlan ? parseFloat(customPrice) : undefined
            });
            toast.success('Plan allocated successfully');
            setIsModalOpen(false);
            fetchData();
            setSelectedTenant('');
            setSelectedPlan('');
            setCustomPrice('');
            setRemarks('');
        } catch (error) {
            toast.error('Failed to allocate plan');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isSuperAdmin) return null;

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-[18px] font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
                        <Layers className="w-6 h-6 text-red-600" />
                        Plan <span className="text-red-600">Allocation</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-[14px]">Assign and manage service tiers for organizations</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white px-6 py-2.5 rounded-xl font-black transition-all shadow-xl active:scale-95 text-[12px] uppercase tracking-widest"
                >
                    <Plus className="w-5 h-5" /> New Allocation
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
                                <th className="px-8 py-5">Organization</th>
                                <th className="px-8 py-5">Plan Detail</th>
                                <th className="px-8 py-5">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={3} className="px-8 py-10 text-center text-gray-400 font-bold">Loading...</td></tr>
                            ) : allocations.map((alloc) => (
                                <tr key={alloc.id} className="group hover:bg-gray-50/50 transition-all">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-[14px]">
                                                {alloc.tenantName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-[14px] font-black text-gray-900 uppercase">{alloc.tenantName}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-[13px] font-black text-red-700 uppercase bg-red-50 px-3 py-1 rounded-lg">
                                            {alloc.planName}
                                        </span>
                                        <div className="flex items-center gap-2 mt-2 text-[12px] font-bold text-gray-500">
                                            <Calendar className="w-3 h-3" />
                                            SINCE {new Date(alloc.startDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className={clsx(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            alloc.active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                        )}>
                                            {alloc.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {alloc.active ? 'ACTIVE' : 'EXPIRED'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8 space-y-6">
                        <h2 className="text-[18px] font-black tracking-tight uppercase">Allocate Plan</h2>
                        <form onSubmit={handleAllocate} className="space-y-4">
                            <select
                                value={selectedTenant}
                                onChange={(e) => setSelectedTenant(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900"
                            >
                                <option value="">Select Tenant</option>
                                {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            
                            <select
                                value={selectedPlan}
                                onChange={(e) => setSelectedPlan(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900"
                            >
                                <option value="">Select Plan</option>
                                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-50 text-gray-500 rounded-xl font-bold uppercase text-[12px]">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[12px] shadow-lg shadow-red-200">
                                    {submitting ? 'Allocating...' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
