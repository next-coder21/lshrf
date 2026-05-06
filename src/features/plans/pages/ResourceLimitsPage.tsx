import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllResourceLimits, fetchTenantResourceLimit } from '../store/billingSlice';
import { ShieldCheck, TrendingUp, Users, Briefcase, AlertTriangle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export const ResourceLimitsPage = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const { resourceLimits, loading } = useAppSelector(state => state.billing);
    
    const isSuperAdmin = user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'SUPER_ADMIN';

    useEffect(() => {
        if (isSuperAdmin) {
            dispatch(fetchAllResourceLimits());
        } else if (user?.tenantId) {
            dispatch(fetchTenantResourceLimit(user.tenantId));
        }
    }, [dispatch, isSuperAdmin, user?.tenantId]);

    const ProgressBar = ({ percentage, color = "bg-red-600" }: { percentage: number, color?: string }) => (
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
                className={clsx("h-full transition-all duration-1000 ease-out rounded-full", color)}
                style={{ width: `${Math.min(100, percentage)}%` }}
            />
        </div>
    );

    const StatCard = ({ title, current, max, icon: Icon, colorClass }: any) => {
        const percentage = max > 0 ? (current / max) * 100 : 0;
        const color = percentage > 80 ? "bg-red-600" : colorClass.bgClass;
        
        return (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div className={clsx("p-2.5 rounded-xl", colorClass.bg)}>
                        <Icon className={clsx("w-5 h-5", colorClass.text)} />
                    </div>
                    <div className={clsx("px-3 py-1 rounded-full text-[12px] font-black uppercase tracking-wider",
                        percentage >= 100 ? "bg-red-50 text-red-600" :
                        percentage > 80 ? "bg-yellow-50 text-yellow-600" :
                        "bg-green-50 text-green-600"
                    )}>
                        {percentage.toFixed(0)}% USED
                    </div>
                </div>
                <div>
                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-[24px] font-black text-gray-900">{current}</h3>
                        <span className="text-gray-400 font-bold">/ {max < 0 ? 'UNLIMITED' : max}</span>
                    </div>
                </div>
                {max > 0 && <ProgressBar percentage={percentage} color={color} />}
            </div>
        );
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500 font-bold animate-pulse">Loading Limits...</div>;
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700">
            <div className="space-y-1">
                <h1 className="text-[18px] font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
                    <TrendingUp className="w-6 h-6 text-red-600" />
                    Resource <span className="text-red-600">Limits</span>
                </h1>
                <p className="text-gray-500 font-medium text-[14px]">
                    Monitor system usage against plan quotas
                </p>
            </div>

            {isSuperAdmin ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
                                    <th className="px-8 py-5">Tenant</th>
                                    <th className="px-8 py-5">Plan</th>
                                    <th className="px-8 py-5">Max Users</th>
                                    <th className="px-8 py-5">Current Users</th>
                                    <th className="px-8 py-5">Max Employees</th>
                                    <th className="px-8 py-5">Current Employees</th>
                                    <th className="px-8 py-5">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {resourceLimits.map(lim => (
                                    <tr key={lim.tenantId} className="group hover:bg-gray-50/50 transition-all">
                                        <td className="px-8 py-5 text-[13px] font-black text-gray-900 uppercase">
                                            {lim.tenantName}
                                        </td>
                                        <td className="px-8 py-5 text-[13px] font-bold text-gray-600 uppercase">
                                            {lim.planName}
                                        </td>
                                        <td className="px-8 py-5 font-bold text-gray-600">{lim.maxUsers < 0 ? '∞' : lim.maxUsers}</td>
                                        <td className="px-8 py-5 font-bold text-gray-900">{lim.currentUsers}</td>
                                        <td className="px-8 py-5 font-bold text-gray-600">{lim.maxEmployees < 0 ? '∞' : lim.maxEmployees}</td>
                                        <td className="px-8 py-5 font-bold text-gray-900">{lim.currentEmployees}</td>
                                        <td className="px-8 py-5">
                                            {lim.isWithinLimits ? (
                                                <div className="inline-flex items-center gap-1.5 text-green-600 font-black text-[10px] uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">
                                                    <CheckCircle2 className="w-3 h-3" /> WITHIN LIMITS
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 text-red-600 font-black text-[10px] uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full animate-pulse">
                                                    <AlertTriangle className="w-3 h-3" /> AT CAPACITY
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resourceLimits.length > 0 && (
                        <>
                            <StatCard
                                title="Platform Users"
                                current={resourceLimits[0].currentUsers}
                                max={resourceLimits[0].maxUsers}
                                icon={Users}
                                colorClass={{ bg: "bg-blue-50", text: "text-blue-600", bgClass: "bg-blue-600" }}
                            />
                            <StatCard
                                title="Total Employees"
                                current={resourceLimits[0].currentEmployees}
                                max={resourceLimits[0].maxEmployees}
                                icon={Briefcase}
                                colorClass={{ bg: "bg-purple-50", text: "text-purple-600", bgClass: "bg-purple-600" }}
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
