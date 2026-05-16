import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/api/axiosInstance';
import { Building2, Users, DollarSign, TrendingUp, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

interface SuperAdminStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  totalEmployees: number;
  monthlyRevenue: number;
  newTenantsThisMonth: number;
  newUsersThisMonth: number;
}

export const SuperAdminDashboard = () => {
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/super-admin/stats')
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load platform stats'))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Total Clients', value: stats.totalTenants, sub: `${stats.activeTenants} active`, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Users', value: stats.totalUsers, sub: `+${stats.newUsersThisMonth} this month`, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Employees', value: stats.totalEmployees, sub: 'across all tenants', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Monthly Revenue', value: `$${stats.monthlyRevenue.toLocaleString()}`, sub: `${stats.newTenantsThisMonth} new clients`, icon: DollarSign, color: 'text-red-600', bg: 'bg-red-50' },
  ] : [];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
          Platform <span className="text-red-600">Command Center</span>
        </h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Super Admin — Global Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm animate-pulse h-32" />
        )) : cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
              <p className="text-2xl font-black text-gray-900">{card.value}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{card.sub}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${card.bg}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-red-600" />
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Onboard New Client', href: '/org/clients', icon: Building2 },
            { label: 'Manage Users', href: '/org/users', icon: Users },
            { label: 'Plan Allocation', href: '/plans/allocation', icon: DollarSign },
          ].map((action, i) => (
            <a key={i} href={action.href} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <action.icon className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest group-hover:text-gray-900">{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
