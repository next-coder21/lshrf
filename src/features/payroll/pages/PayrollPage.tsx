import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayrolls, processPayroll, updatePayrollStatus } from '../store/payrollSlice';
import { fetchEmployees } from '@/features/employees/store/employeeSlice';
import { RootState, AppDispatch } from '@/store/store';
import {
    DollarSign, Plus, Download,
    Search, Filter, CreditCard,
    CheckCircle2, Clock, XCircle,
    TrendingUp, ArrowUpRight, ArrowDownRight,
    Briefcase, Calendar, MoreVertical,
    FileText, User, ChevronRight,
    Banknote, PieChart
} from 'lucide-react';
import clsx from 'clsx';
import { PayrollStatus } from '../types/payroll.types';

export const PayrollPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { payrolls, loading } = useSelector((state: RootState) => state.payroll);
    const { employees } = useSelector((state: RootState) => state.employees);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPeriod, setFilterPeriod] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    // Form State
    const [formData, setFormData] = useState({
        employeeId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        baseSalary: 0,
        bonuses: 0,
        deductions: 0,
        paymentMethod: 'BANK_TRANSFER',
        remarks: ''
    });

    useEffect(() => {
        dispatch(fetchPayrolls());
        dispatch(fetchEmployees());
    }, [dispatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(processPayroll(formData)).unwrap();
            setIsModalOpen(false);
            setFormData({
                ...formData,
                employeeId: '',
                baseSalary: 0,
                bonuses: 0,
                deductions: 0,
                remarks: ''
            });
            alert('Payroll processed successfully!');
        } catch (error: any) {
            alert(error.message || 'Failed to process payroll');
        }
    };

    const handleStatusUpdate = async (id: string, status: PayrollStatus) => {
        try {
            await dispatch(updatePayrollStatus({ id, status })).unwrap();
        } catch (error: any) {
            alert(error.message || 'Failed to update status');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getStatusStyle = (status: PayrollStatus) => {
        switch (status) {
            case 'PAID': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'PROCESSED': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const filteredPayrolls = payrolls.filter(p =>
        p.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalStats = {
        totalPayout: payrolls.reduce((acc, curr) => acc + curr.netSalary, 0),
        avgSalary: payrolls.length > 0 ? (payrolls.reduce((acc, curr) => acc + curr.netSalary, 0) / payrolls.length) : 0,
        paidCount: payrolls.filter(p => p.status === 'PAID').length
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700 bg-gray-50/50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">
                        Enterprise <span className="text-red-600">Payroll</span>
                    </h1>
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-3 h-3 text-red-600" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Financial Disbursement Control</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-100 text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                        <Download className="w-4 h-4 text-red-600" />
                        Statements
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl hover:shadow-gray-400/30 active:scale-95"
                    >
                        <Banknote className="w-4 h-4" />
                        Process Payroll
                    </button>
                </div>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-100 transition-colors" />
                    <div className="relative space-y-4">
                        <div className="p-3 bg-emerald-50 w-fit rounded-2xl">
                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Net Disbursement</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter mt-1">{formatCurrency(totalStats.totalPayout)}</p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                            <ArrowUpRight className="w-3 h-3" />
                            12% Increase from Dec 2025
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-100 transition-colors" />
                    <div className="relative space-y-4">
                        <div className="p-3 bg-blue-50 w-fit rounded-2xl">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Average Force Yield</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter mt-1">{formatCurrency(totalStats.avgSalary)}</p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                            <PieChart className="w-3 h-3" />
                            Based on {payrolls.length} profiles
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-red-100 transition-colors" />
                    <div className="relative space-y-4">
                        <div className="p-3 bg-red-50 w-fit rounded-2xl">
                            <CheckCircle2 className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Processed Settlements</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter mt-1">{totalStats.paidCount} / {payrolls.length}</p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-red-600 uppercase tracking-widest">
                            <Clock className="w-3 h-3" />
                            Next cycle in 5 days
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search payroll records..."
                                className="bg-gray-50 border border-transparent rounded-2xl py-3 pl-11 pr-6 text-xs font-bold w-full md:w-80 focus:ring-2 focus:ring-red-500/10 outline-none transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="h-10 w-px bg-gray-100 hidden md:block" />
                        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                            <select
                                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer pr-8"
                                value={filterPeriod.month}
                                onChange={e => setFilterPeriod({ ...filterPeriod, month: parseInt(e.target.value) })}
                            >
                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                    <option key={i} value={i + 1}>{m}</option>
                                ))}
                            </select>
                            <select
                                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer pr-8"
                                value={filterPeriod.year}
                                onChange={e => setFilterPeriod({ ...filterPeriod, year: parseInt(e.target.value) })}
                            >
                                {[2024, 2025, 2026].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Period</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Gross Yield</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Deductions</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Net Settlement</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse h-20 bg-gray-50/10" />
                                ))
                            ) : filteredPayrolls.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 grayscale opacity-20">
                                            <CreditCard className="w-16 h-16 text-gray-900" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No financial records found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPayrolls.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md">
                                                    {p.employeeName.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{p.employeeName}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{p.paymentMethod}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-gray-700 uppercase">{['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][p.month]}</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{p.year}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-xs text-gray-900">
                                            {formatCurrency(p.baseSalary + p.bonuses)}
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-xs text-rose-500">
                                            - {formatCurrency(p.deductions)}
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-sm text-gray-900">
                                            {formatCurrency(p.netSalary)}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center">
                                                <span className={clsx(
                                                    "px-3 py-1.5 rounded-full text-[9px] font-black border uppercase tracking-widest",
                                                    getStatusStyle(p.status)
                                                )}>
                                                    {p.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {p.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(p.id, 'PAID')}
                                                        className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all active:scale-95 shadow-sm"
                                                        title="Mark as Paid"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-900 hover:text-white transition-all active:scale-95 shadow-sm">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payroll Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-12 space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Financial <span className="text-red-600">Settlement</span></h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Process Personnel Remuneration</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Personnel</label>
                                        <select
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold"
                                            value={formData.employeeId}
                                            onChange={e => {
                                                const emp = employees.find(emp => emp.id === e.target.value);
                                                setFormData({
                                                    ...formData,
                                                    employeeId: e.target.value,
                                                    baseSalary: emp?.salary || 0
                                                });
                                            }}
                                        >
                                            <option value="">Identify profile...</option>
                                            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} [{e.employeeId}]</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Period</label>
                                        <div className="flex gap-2">
                                            <select
                                                className="w-2/3 bg-gray-50 border border-gray-100 rounded-2xl py-4 px-4 text-sm font-bold"
                                                value={formData.month}
                                                onChange={e => setFormData({ ...formData, month: parseInt(e.target.value) })}
                                            >
                                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                                    <option key={i} value={i + 1}>{m}</option>
                                                ))}
                                            </select>
                                            <select
                                                className="w-1/3 bg-gray-50 border border-gray-100 rounded-2xl py-4 px-4 text-sm font-bold"
                                                value={formData.year}
                                                onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                            >
                                                {[2024, 2025, 2026].map(y => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Base Yield</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold"
                                            value={formData.baseSalary}
                                            onChange={e => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest pl-2">Bonuses</label>
                                        <input
                                            type="number"
                                            className="w-full bg-emerald-50/20 border border-emerald-100 rounded-2xl py-4 px-6 text-sm font-black text-emerald-600"
                                            value={formData.bonuses}
                                            onChange={e => setFormData({ ...formData, bonuses: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-2">Deductions</label>
                                        <input
                                            type="number"
                                            className="w-full bg-rose-50/20 border border-rose-100 rounded-2xl py-4 px-6 text-sm font-black text-rose-600"
                                            value={formData.deductions}
                                            onChange={e => setFormData({ ...formData, deductions: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-900 rounded-3xl p-8 flex items-center justify-between text-white shadow-2xl">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">Net Remuneration Value</p>
                                        <p className="text-3xl font-black tracking-tighter">{formatCurrency(formData.baseSalary + formData.bonuses - formData.deductions)}</p>
                                    </div>
                                    <div className="p-4 bg-white/10 rounded-2xl">
                                        <Banknote className="w-8 h-8 text-red-500" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Operational Remarks</label>
                                    <textarea
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold h-24 resize-none"
                                        placeholder="Add transaction notes..."
                                        value={formData.remarks}
                                        onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-800 transition-all active:scale-[0.98] mt-4"
                                >
                                    Authorize Disbursement
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
